import functools
import http.server
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest

from capture_timing import (
    SIGNATURE_PACKETS, TimingJournal, instrument_hls, match_timeline,
    media_packets, read_journal,
)


def signature(prefix):
    return [f"{prefix}:{i}" for i in range(SIGNATURE_PACKETS)]


class ClockMatchingTest(unittest.TestCase):
    def test_matches_a_gap_without_using_capture_end(self):
        rows = [{"version": 1, "captureAnchorMs": 100000},
                {"wallClockMs": 80000, "signature": signature("a")},
                {"wallClockMs": 112000, "signature": signature("b"), "boundary": True}]
        packets = [(i / 50, h) for i, h in enumerate(signature("a"))]
        packets += [(12 + i / 50, h) for i, h in enumerate(signature("b"))]
        clock = match_timeline(rows, iter(packets))
        self.assertEqual(clock["points"], [{"mediaSec": 0, "wallClockMs": 80000},
                                           {"mediaSec": 12, "wallClockMs": 112000}])

    def test_repeated_content_at_a_break_is_not_guessed(self):
        rows = [{"version": 1, "captureAnchorMs": 100000},
                {"wallClockMs": 100000, "signature": signature("a"), "boundary": True}]
        packets = [(i, h) for i, h in enumerate(signature("a") * 2)]
        self.assertIsNone(match_timeline(rows, iter(packets)))

    def test_failed_boundary_probe_invalidates_map(self):
        self.assertIsNone(match_timeline([{"version": 1, "captureAnchorMs": 1},
                                         {"unmatchedBoundary": True}], iter([])))

    def test_interrupted_journal_is_not_presented_as_verified(self):
        rows = [{"version": 1, "captureAnchorMs": 100000, "completeRequired": True},
                {"wallClockMs": 100000, "signature": signature("a")}]
        self.assertIsNone(match_timeline(rows, enumerate(signature("a"))))

    def test_backwards_source_clock_is_rejected(self):
        rows = [{"version": 1, "captureAnchorMs": 1},
                {"wallClockMs": 10000, "signature": signature("a")},
                {"wallClockMs": 9000, "signature": signature("b")}]
        self.assertIsNone(match_timeline(rows, enumerate(signature("a") + signature("b"))))


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "ffmpeg is required")
class ActualMediaTest(unittest.TestCase):
    def capture_fixture(self, kind, missing=False, chunked=False):
        from streamlink import Streamlink
        from streamlink.stream.hls import HLSStream
        from datetime import datetime, timezone
        with tempfile.TemporaryDirectory(prefix="tsr-clock-test-") as directory:
            root = Path(directory)
            playlist = root / "source.m3u8"
            subprocess.run([
                "ffmpeg", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=160x90:rate=15",
                "-f", "lavfi", "-i", "anoisesrc=color=pink:seed=137:r=48000", "-t", "24",
                "-c:v", "libx264", "-preset", "ultrafast", "-g", "30", "-bf", "0",
                "-sc_threshold", "0", "-c:a", "aac", "-f", "hls", "-hls_time", "2",
                "-hls_list_size", "0", "-hls_segment_type", kind, str(playlist),
            ], check=True, capture_output=True, cwd=root)
            # Remove twelve seconds of media; the original timestamps remain
            # in the surviving files, as they do after a real network outage.
            lines = playlist.read_text().splitlines()
            rewritten = []
            index = 0
            pending = None
            for line in lines:
                if line.startswith("#EXTINF"):
                    pending = line
                elif not line.startswith("#") and line:
                    if not missing or index not in range(3, 9):
                        wall = datetime.fromtimestamp(1_700_000_000 + index * 2, timezone.utc).isoformat()
                        rewritten.extend([f"#EXT-X-PROGRAM-DATE-TIME:{wall}", pending, line])
                    index += 1
                else:
                    rewritten.append(line)
            playlist.write_text("\n".join(rewritten) + "\n")
            server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(QuietHandler, directory=directory))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            journal = TimingJournal(root / "clock.jsonl", 1_700_000_020_000)
            session = Streamlink()
            session.set_option("hls-live-restart", True)
            stream = HLSStream(session, f"http://127.0.0.1:{server.server_port}/source.m3u8")
            try:
                self.assertTrue(instrument_hls(stream, journal))
                reader = stream.open()
                try:
                    with (root / "capture.bin").open("wb") as output:
                        while True:
                            block = reader.read(65536)
                            if not block:
                                break
                            output.write(block)
                finally:
                    reader.close()
            finally:
                journal.close()
                server.shutdown()
                server.server_close()
            source = root / "capture.bin"
            if chunked:
                subprocess.run(["ffmpeg", "-v", "error", "-i", str(source), "-c", "copy",
                                "-f", "segment", "-segment_format", "mpegts", "-segment_time", "4",
                                str(root / "part%03d.ts")], check=True, capture_output=True)
                source = root / "joined.ts"
                source.write_bytes(b"".join(p.read_bytes() for p in sorted(root.glob("part*.ts"))))
            final = root / "video.mp4"
            subprocess.run(["ffmpeg", "-v", "error", "-i", str(source), "-c", "copy",
                            "-bsf:a", "aac_adtstoasc", "-movflags", "+faststart", str(final)],
                           check=True, capture_output=True)
            rows = read_journal(root / "clock.jsonl")
            timeline = match_timeline(rows, media_packets(final))
            self.assertIsNotNone(timeline, rows)
            self.assertAlmostEqual(timeline["points"][0]["wallClockMs"], 1_700_000_000_000, delta=100)
            self.assertAlmostEqual(timeline["points"][0]["mediaSec"], 0, delta=0.1)
            if missing:
                self.assertGreaterEqual(len(timeline["points"]), 2)
                first, last = timeline["points"][0], timeline["points"][-1]
                removed = (last["wallClockMs"] - first["wallClockMs"]) / 1000 - (last["mediaSec"] - first["mediaSec"])
                self.assertAlmostEqual(removed, 12, delta=0.2)

    def test_mpegts_remux(self):
        self.capture_fixture("mpegts")

    def test_fmp4_remux(self):
        self.capture_fixture("fmp4")

    def test_chunk_join_with_missing_media(self):
        self.capture_fixture("mpegts", missing=True, chunked=True)


if __name__ == "__main__":
    unittest.main()
