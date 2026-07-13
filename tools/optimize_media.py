#!/usr/bin/env python3
"""Media optimizer for akamaestro.com.

Converts heavy media into web-ready formats, next to the originals
(originals are never modified or deleted):

  foo.gif  ->  foo.mp4 (h264, capped 1280w) + foo.poster.webp (first frame)
  foo.png  ->  foo.webp (capped 1600w, q82) + foo.thumb.webp (640w) when large
  foo.jpg  ->  same as png

Usage:
  tools/.venv/bin/python tools/optimize_media.py projects/balance/gif2.gif
  tools/.venv/bin/python tools/optimize_media.py --all          # whole projects/ tree
  tools/.venv/bin/python tools/optimize_media.py --all --force  # redo existing outputs

Idempotent: skips outputs that already exist and are newer than the source.
"""
import argparse
import subprocess
import sys
from pathlib import Path

from PIL import Image
import imageio_ffmpeg

REPO = Path(__file__).resolve().parent.parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

IMG_EXTS = {".png", ".jpg", ".jpeg"}
SKIP_DIRS = {"Archive", "tools", ".git", ".vscode"}
IMG_MIN_BYTES = 150 * 1024  # leave small images alone

VIDEO_MAX_W = 1280
IMG_MAX_W = 1600
THUMB_W = 640
WEBP_Q = 82
THUMB_Q = 78
CRF = "26"


def fmt(n):
    for unit in ("B", "KB", "MB"):
        if n < 1024:
            return f"{n:.0f}{unit}"
        n /= 1024
    return f"{n:.1f}GB"


def outdated(src: Path, out: Path, force: bool) -> bool:
    return force or not out.exists() or out.stat().st_mtime < src.stat().st_mtime


def gif_to_mp4(src: Path, force: bool, report: list):
    mp4 = src.with_suffix(".mp4")
    poster = src.with_suffix(".poster.webp")
    if outdated(src, mp4, force):
        vf = f"scale='trunc(min({VIDEO_MAX_W},iw)/2)*2':-2"
        cmd = [FFMPEG, "-y", "-i", str(src), "-movflags", "+faststart",
               "-pix_fmt", "yuv420p", "-vf", vf, "-c:v", "libx264",
               "-crf", CRF, "-preset", "medium", "-an", str(mp4)]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"  FFMPEG FAILED {src}: {res.stderr[-300:]}", file=sys.stderr)
            return
        report.append((src, mp4))
    if outdated(src, poster, force):
        with Image.open(src) as im:
            im.seek(0)
            frame = im.convert("RGB")
            frame.thumbnail((IMG_MAX_W, 10_000))
            frame.save(poster, "WEBP", quality=WEBP_Q, method=6)


def img_to_webp(src: Path, force: bool, report: list):
    webp = src.with_suffix(".webp")
    thumb = src.with_suffix(".thumb.webp")
    try:
        with Image.open(src) as im:
            has_alpha = im.mode in ("RGBA", "LA") or (
                im.mode == "P" and "transparency" in im.info)
            im = im.convert("RGBA" if has_alpha else "RGB")
            if outdated(src, webp, force):
                main = im.copy()
                main.thumbnail((IMG_MAX_W, 10_000))
                main.save(webp, "WEBP", quality=WEBP_Q, method=6)
                if webp.stat().st_size >= src.stat().st_size:
                    webp.unlink()  # webp can inflate flat graphics; original wins
                else:
                    report.append((src, webp))
            if im.width > THUMB_W and outdated(src, thumb, force):
                t = im.copy()
                t.thumbnail((THUMB_W, 10_000))
                t.save(thumb, "WEBP", quality=THUMB_Q, method=6)
    except Exception as e:
        print(f"  SKIP {src}: {e}", file=sys.stderr)


def is_generated(p: Path) -> bool:
    return p.name.endswith((".poster.webp", ".thumb.webp"))


def collect(args) -> list:
    if args.all:
        files = [p for p in (REPO / "projects").rglob("*") if p.is_file()]
    else:
        files = [Path(p).resolve() for p in args.paths]
    picked = []
    for p in files:
        if set(p.relative_to(REPO).parts) & SKIP_DIRS or is_generated(p):
            continue
        ext = p.suffix.lower()
        if ext == ".gif":
            picked.append(p)
        elif ext in IMG_EXTS and p.stat().st_size >= IMG_MIN_BYTES:
            picked.append(p)
    return picked


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*", help="specific files to convert")
    ap.add_argument("--all", action="store_true", help="sweep projects/ tree")
    ap.add_argument("--force", action="store_true", help="rebuild existing outputs")
    args = ap.parse_args()
    if not args.paths and not args.all:
        ap.error("give file paths or --all")

    report = []
    for p in collect(args):
        if p.suffix.lower() == ".gif":
            gif_to_mp4(p, args.force, report)
        else:
            img_to_webp(p, args.force, report)

    total_in = total_out = 0
    for src, out in report:
        a, b = src.stat().st_size, out.stat().st_size
        total_in += a
        total_out += b
        print(f"{fmt(a):>8} -> {fmt(b):>8}  ({100 - b * 100 // a:>2}% saved)  {src.relative_to(REPO)}")
    if report:
        print(f"\nTOTAL: {fmt(total_in)} -> {fmt(total_out)} "
              f"({100 - total_out * 100 // total_in}% saved) across {len(report)} files")
    else:
        print("Nothing to do (outputs up to date).")


if __name__ == "__main__":
    main()
