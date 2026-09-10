"""Capture HLS clocks, then match them to packets in the finished recording.

PDT belongs to a source segment, not to the instant its download finishes.
Audio packet fingerprints survive stream-copy/remux, so a second pass can
locate each clock anchor even when ffmpeg rebases timestamps or removes gaps.
The journal contains timings and hashes only, never signed stream URLs.
"""
from __future__ import annotations

import argparse
from collections import defaultdict, deque
from datetime import timezone
import json
import hashlib
import logging
import math
from pathlib import Path
import queue
import signal
import subprocess
import sys
import threading
import time

SIGNATURE_PACKETS = 8
SAMPLE_SECONDS = 30
MAX_SAMPLE_BYTES = 12 * 1024 * 1024


def probe_signature(payload: bytes, wall_ms: float, ffprobe="ffprobe"):
    result = subprocess.run([
        ffprobe, "-v", "error", "-select_streams", "a:0", "-show_packets", "-show_streams",
        "-show_data", "-show_format", "-show_entries",
        "stream=codec_name:format=start_time:packet=pts_time,data,size",
        "-of", "json", "-i", "pipe:0",
    ], input=payload, capture_output=True, timeout=15)
    if result.returncode:
        raise ValueError("Source segment could not be probed")
    data = json.loads(result.stdout)
    if not data.get("streams") or data["streams"][0].get("codec_name") != "aac":
        raise ValueError("Unsupported audio codec for timing")
    selected = [p for p in data.get("packets", []) if "pts_time" in p and p.get("data")]
    if len(selected) < SIGNATURE_PACKETS:
        raise ValueError("Source segment has too few audio packets")
    # EXT-X-PROGRAM-DATE-TIME denotes the first media sample of the segment.
    first_pts = float(data["format"]["start_time"])
    first_audio_pts = float(selected[0]["pts_time"])
    return {
        "wallClockMs": wall_ms + (first_audio_pts - first_pts) * 1000,
        "signature": [aac_fingerprint(p["data"], int(p["size"])) for p in selected[:SIGNATURE_PACKETS]],
    }


def aac_fingerprint(dump, size):
    payload = bytes.fromhex("".join(line.split(":", 1)[1].split("  ", 1)[0].strip()
                                     for line in dump.splitlines() if ":" in line))[:size]
    # TS carries ADTS headers; the finished MP4 carries raw AAC access units.
    # Hash the same codec payload on both sides of that lossless conversion.
    if len(payload) >= 7 and payload[0] == 0xFF and payload[1] & 0xF6 == 0xF0:
        frame_size = ((payload[3] & 3) << 11) | (payload[4] << 3) | (payload[5] >> 5)
        if frame_size == len(payload):
            payload = payload[7 if payload[1] & 1 else 9:]
    return "SHA256:" + hashlib.sha256(payload).hexdigest()


class TimingJournal:
    def __init__(self, path, anchor_ms, ffprobe="ffprobe"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.file = self.path.open("w", encoding="utf-8")
        self.ffprobe = ffprobe
        self.invalid = False
        self.lock = threading.Lock()
        self.jobs = queue.Queue(maxsize=3)
        self.emit({"version": 1, "captureAnchorMs": anchor_ms, "completeRequired": True})
        self.thread = threading.Thread(target=self.work, daemon=True)
        self.thread.start()

    def emit(self, row):
        with self.lock:
            try:
                self.file.write(json.dumps(row, separators=(",", ":")) + "\n")
                self.file.flush()
            except OSError:
                self.invalid = True

    def sample(self, payload, wall_ms, boundary):
        if len(payload) > MAX_SAMPLE_BYTES:
            self.emit({"unmatchedBoundary": boundary, "reason": "segment too large"})
            return
        try:
            self.jobs.put_nowait((payload, wall_ms, boundary))
        except queue.Full:
            # Timing must never exert backpressure on capture. A missed break
            # makes the clock unverified instead of pretending it was measured.
            self.emit({"unmatchedBoundary": boundary, "reason": "timing queue full"})

    def work(self):
        while True:
            job = self.jobs.get()
            if job is None:
                return
            payload, wall_ms, boundary = job
            try:
                row = probe_signature(payload, wall_ms, self.ffprobe)
                self.emit({**row, "boundary": boundary})
            except Exception as error:
                self.emit({"unmatchedBoundary": boundary, "reason": type(error).__name__})

    def close(self):
        try:
            self.jobs.put(None, timeout=20)
        except queue.Full:
            self.invalid = True
        self.thread.join(timeout=45)
        self.emit({"complete": not self.invalid and not self.thread.is_alive()})
        self.file.close()


def instrument_hls(stream, journal):
    """Use Streamlink's existing platform reader/writer, including retries and
    filtering. The adapter is tested against the pinned Streamlink release.
    No global classes are patched; only this capture's reader is extended.
    """
    from streamlink.stream.hls import HLSStream
    if not isinstance(stream, HLSStream):
        return False
    original_reader = stream.__reader__
    original_writer = original_reader.__writer__

    class TimedWriter(original_writer):
        timing_init = b""
        timing_last_num = None
        timing_last_end = None
        timing_last_sample = None

        def write(self, segment, result, *data):
            is_map = bool(data and data[0])
            filtered = self.should_filter_segment(segment)
            # This capture uses complete segments, not low-latency chunked
            # responses. Reading .content therefore does not consume the
            # response differently from Streamlink's original writer.
            answer = super().write(segment, result, *data)
            if filtered or self.closed:
                return answer
            try:
                self.record_timing(segment, result, is_map)
            except Exception:
                journal.invalid = True
                logging.warning("Timing metadata unavailable; capture continues")
            return answer

        def record_timing(self, segment, result, is_map):
            payload = result.content
            if is_map:
                self.timing_init = payload if len(payload) <= 1024 * 1024 else b""
                return
            date = segment.date
            if date is None:
                journal.emit({"unmatchedBoundary": True, "reason": "missing program date time"})
                return
            wall_ms = date.replace(tzinfo=date.tzinfo or timezone.utc).timestamp() * 1000
            boundary = self.timing_last_num is not None and (
                segment.num != self.timing_last_num + 1 or segment.discontinuity
                or abs(wall_ms - self.timing_last_end) > 500
            )
            due = self.timing_last_sample is None or boundary or wall_ms - self.timing_last_sample >= SAMPLE_SECONDS * 1000
            self.timing_last_num = segment.num
            self.timing_last_end = wall_ms + segment.duration * 1000
            if due:
                self.timing_last_sample = wall_ms
                if segment.key and segment.key.method != "NONE":
                    journal.emit({"unmatchedBoundary": True, "reason": "encrypted source"})
                else:
                    journal.sample(self.timing_init + payload, wall_ms, boundary)

    class TimedReader(original_reader):
        __writer__ = TimedWriter

    stream.__reader__ = TimedReader
    return True


def capture(args):
    from streamlink import Streamlink
    session = Streamlink()
    for name, value in {
        "hls-live-restart": True,
        "hls-playlist-reload-attempts": 10,
        "stream-segment-attempts": 5,
        "stream-segment-threads": 2,
        "hls-segment-stream-data": False,
    }.items():
        session.set_option(name, value)
    stopped = threading.Event()
    opened = None

    def stop(*_):
        stopped.set()
        if opened is not None:
            opened.close()

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    journal = TimingJournal(args.journal, args.anchor_ms)
    try:
        stream = None
        for attempt in range(16):
            if stopped.is_set():
                return 0
            try:
                streams = session.streams(args.url)
                stream = next((streams[q] for q in args.quality.split(",") if q in streams), None)
                if stream is not None:
                    break
            except Exception:
                logging.warning("Stream lookup failed (attempt %s/16)", attempt + 1)
            if attempt < 15:
                stopped.wait(4)
        if stream is None:
            raise RuntimeError("Requested stream quality is unavailable")
        if not instrument_hls(stream, journal):
            journal.emit({"unmatchedBoundary": True, "reason": "non-HLS capture"})
        for attempt in range(3):
            try:
                opened = stream.open()
                break
            except Exception:
                if attempt == 2 or stopped.is_set():
                    raise
        output = sys.stdout.buffer if args.output == "-" else open(args.output, "wb")
        try:
            while not stopped.is_set():
                chunk = opened.read(65536)
                if not chunk:
                    break
                output.write(chunk)
            output.flush()
        finally:
            if output is not sys.stdout.buffer:
                output.close()
        return 0
    finally:
        if opened is not None:
            opened.close()
        journal.close()


def read_journal(path):
    rows = []
    with open(path, encoding="utf-8") as source:
        for line in source:
            try:
                rows.append(json.loads(line))
            except ValueError:
                # A process killed during a write can leave one partial line.
                continue
    return rows


def match_timeline(rows, packets):
    if not rows or rows[0].get("version") != 1 or any(r.get("unmatchedBoundary") for r in rows):
        return None
    if rows[0].get("completeRequired") and not rows[-1].get("complete"):
        return None
    samples = [r for r in rows if len(r.get("signature", [])) == SIGNATURE_PACKETS]
    wanted = defaultdict(list)
    for index, sample in enumerate(samples):
        wanted[tuple(sample["signature"])].append(index)
    matches = defaultdict(list)
    window = deque(maxlen=SIGNATURE_PACKETS)
    for pts, fingerprint in packets:
        window.append((pts, fingerprint))
        if len(window) != SIGNATURE_PACKETS:
            continue
        for index in wanted.get(tuple(p[1] for p in window), []):
            if len(matches[index]) < 2:
                matches[index].append(window[0][0])
    points = []
    for index, sample in enumerate(samples):
        # Silence/repeated content can match many positions. Never choose an
        # arbitrary occurrence. Ordinary anchors may be skipped; a missing
        # discontinuity anchor invalidates the map.
        if len(matches[index]) != 1 or len(wanted[tuple(sample["signature"])]) != 1:
            if sample.get("boundary"):
                return None
            continue
        point = {"mediaSec": matches[index][0], "wallClockMs": sample["wallClockMs"]}
        if not all(math.isfinite(v) for v in point.values()):
            return None
        if points and (point["mediaSec"] <= points[-1]["mediaSec"] or point["wallClockMs"] <= points[-1]["wallClockMs"]):
            return None
        points.append(point)
    if not points:
        return None
    return {"version": 1, "captureAnchorMs": rows[0]["captureAnchorMs"], "points": points}


def media_packets(path, ffprobe="ffprobe"):
    child = subprocess.Popen([
        ffprobe, "-v", "error", "-select_streams", "a:0", "-show_packets",
        "-show_data_hash", "sha256", "-show_entries", "packet=pts_time,data_hash",
        "-of", "compact=p=0", str(path),
    ], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    try:
        for line in child.stdout:
            fields = dict(field.split("=", 1) for field in line.strip().split("|") if "=" in field)
            if "pts_time" in fields and "data_hash" in fields:
                yield float(fields["pts_time"]), fields["data_hash"]
        if child.wait() != 0:
            raise ValueError("Finished media could not be probed")
    finally:
        child.stdout.close()
        if child.poll() is None:
            child.kill()
            child.wait()


def main():
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    record = commands.add_parser("capture")
    record.add_argument("--journal", required=True)
    record.add_argument("--anchor-ms", type=float, required=True)
    record.add_argument("--output", required=True)
    record.add_argument("url")
    record.add_argument("quality")
    build = commands.add_parser("build")
    build.add_argument("--journal", required=True)
    build.add_argument("--media", required=True)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, stream=sys.stderr)
    if args.command == "capture":
        try:
            return capture(args)
        except Exception as error:
            # Exception text from HTTP libraries may contain signed URLs.
            logging.error("Capture stopped: %s", type(error).__name__)
            return 1
    try:
        timeline = match_timeline(read_journal(args.journal), media_packets(args.media))
        print(json.dumps(timeline, separators=(",", ":")))
        return 0
    except Exception as error:
        logging.error("Clock verification failed: %s", type(error).__name__)
        return 1


if __name__ == "__main__":
    sys.exit(main())
