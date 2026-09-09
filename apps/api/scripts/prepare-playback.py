#!/usr/bin/env python3
"""Explicit, bounded HLS pilot preparation. Run inside the API container.

python3 scripts/prepare-playback.py SESSION_ID
No source files are removed or changed. No background/mass transcoding.
"""
import argparse
import fcntl
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import time
from urllib.request import urlopen

MAX_CACHE = 768 * 1024**2
MAX_BUNDLE = 600 * 1024**2
MIN_FREE = 20 * 1024**3
ID = re.compile(r"[a-z0-9]{20,32}\Z")


def size(folder):
    return sum(p.stat().st_size for p in folder.rglob("*") if p.is_file())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("session_id")
    args = parser.parse_args()
    if not ID.fullmatch(args.session_id):
        raise SystemExit("Invalid session ID")
    root = (Path(os.environ.get("DATA_DIR", "/data")) / "playback-cache").resolve()
    root.mkdir(parents=True, exist_ok=True)
    with (root / ".prepare.lock").open("w") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        target = root / args.session_id
        if target.exists():
            raise SystemExit("Bundle already exists; use a different recording or explicitly remove its derived cache first")
        api = f"http://127.0.0.1:{os.environ.get('PORT', '3001')}/api/public/streams/{args.session_id}"
        with urlopen(api, timeout=30) as response:
            item = json.load(response)["item"]
        duration = item.get("durationSec") or 0
        if item.get("audioOnly") or len(item.get("parts", [])) > 1 or not 0 < duration <= 900:
            raise SystemExit("Pilot requires a single video recording up to 15 minutes")
        expected = int(item.get("fileSizeBytes") or 0)
        if not 0 < expected * 1.05 < MAX_BUNDLE:
            raise SystemExit("Recording exceeds the 600 MiB preparation budget")
        # Remove only expired derived bundles carrying our own ready marker.
        for child in root.iterdir():
            if not child.is_dir() or child.is_symlink() or not ID.fullmatch(child.name):
                continue
            try:
                marker = json.loads((child / "ready.json").read_text())
                if marker.get("version") == 1 and marker.get("expiresAt", math.inf) < time.time() * 1000:
                    shutil.rmtree(child)
            except (OSError, ValueError):
                pass
        available = MAX_CACHE - size(root)
        if available < expected * 1.05 or shutil.disk_usage(root).free < MIN_FREE + expected * 1.05:
            raise SystemExit("Insufficient cache budget or free disk space (20 GiB reserve)")

        temp = Path(tempfile.mkdtemp(prefix=".building-", dir=root))
        try:
            def run(command, timeout=900):
                with (temp / "ffmpeg.log").open("w+") as log:
                    proc = subprocess.Popen(["nice", "-n", "10", *command], cwd=temp,
                                            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=log)
                    started = time.monotonic()
                    try:
                        while proc.poll() is None:
                            if time.monotonic() - started > timeout or size(temp) > min(MAX_BUNDLE, available) or shutil.disk_usage(root).free < MIN_FREE:
                                raise RuntimeError("Preparation stopped: time/disk/cache budget exceeded")
                            time.sleep(1)
                        if proc.returncode:
                            log.seek(0)
                            raise RuntimeError(log.read()[-2000:])
                    finally:
                        if proc.poll() is None:
                            proc.kill()
                        proc.wait()

            print(f"Preparing {args.session_id}: {duration}s, {expected / 1024**2:.1f} MiB", flush=True)
            # Copy the original H.264/AAC packets; no lossy encode and one worker.
            run(["ffmpeg", "-hide_banner", "-loglevel", "warning", "-nostdin", "-threads", "1",
                 "-rw_timeout", "30000000", "-i", api + "/video", "-map", "0:v:0", "-map", "0:a:0?",
                 "-c", "copy", "-f", "hls", "-hls_time", "4", "-hls_playlist_type", "vod",
                 "-hls_segment_type", "fmp4", "-hls_fmp4_init_filename", "init.mp4",
                 "-hls_segment_filename", "segment-%06d.m4s", "index.m3u8"])
            manifest = (temp / "index.m3u8").read_text()
            measured = sum(float(x) for x in re.findall(r"#EXTINF:([\d.]+)", manifest))
            if "#EXT-X-ENDLIST" not in manifest or abs(measured - duration) > 3:
                raise RuntimeError(f"Incomplete HLS: expected {duration}s, got {measured}s")
            # Decode keyframes from the local bundle, avoiding another origin read.
            run(["ffmpeg", "-hide_banner", "-loglevel", "warning", "-nostdin", "-threads", "1",
                 "-skip_frame", "nokey", "-i", "index.m3u8", "-an", "-vf",
                 "fps=1/10,scale=160:90:force_original_aspect_ratio=decrease,pad=160:90:(ow-iw)/2:(oh-ih)/2",
                 "-threads", "1", "-q:v", "5", "preview-%06d.jpg"])
            count = len(list(temp.glob("preview-*.jpg")))
            if count < max(1, int(duration / 10) - 1):
                raise RuntimeError("Incomplete preview frames")
            (temp / "ffmpeg.log").unlink(missing_ok=True)
            marker = {"version": 1, "durationSec": measured, "previewCount": count,
                      "previewIntervalSec": 10, "expiresAt": int((time.time() + 30 * 86400) * 1000)}
            (temp / "ready.json").write_text(json.dumps(marker))
            if size(temp) > min(MAX_BUNDLE, available):
                raise RuntimeError("Bundle exceeds cache budget")
            temp.rename(target)  # Atomic publication, never a partial playlist.
            print(f"Ready: {size(target) / 1024**2:.1f} MiB, {count} previews, {measured:.3f}s", flush=True)
        finally:
            if temp.exists():
                shutil.rmtree(temp)


if __name__ == "__main__":
    main()
