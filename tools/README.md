# Media workflow

One-time setup (already done on this machine):

```bash
python3 -m venv tools/.venv
tools/.venv/bin/pip install Pillow imageio-ffmpeg
```

## Adding new images / videos to the site

1. Drop the original files into the right `projects/<name>/` folder.
2. Run the optimizer:

```bash
# specific files
tools/.venv/bin/python tools/optimize_media.py projects/keybound/new-shot.png

# or everything (skips already-converted files, so it's fast to re-run)
tools/.venv/bin/python tools/optimize_media.py --all
```

3. Reference the **generated** files in HTML, never the originals:

| Original | Use in HTML |
|---|---|
| `foo.gif` | `<video src="foo.mp4" poster="foo.poster.webp" autoplay muted loop playsinline>` |
| `foo.png` / `foo.jpg` | `<img src="foo.webp">` (full) or `foo.thumb.webp` (grid/thumbnail) |

What it generates, next to each original:

- `foo.gif` → `foo.mp4` (h264, ≤1280px wide) + `foo.poster.webp` (first frame, for instant paint)
- `foo.png|jpg` → `foo.webp` (≤1600px, q82) + `foo.thumb.webp` (640px) when the source is large

Rules baked in: originals are never touched; images under 150KB are left alone;
`Archive/` is ignored; re-runs only process new/changed files (`--force` rebuilds all).

Typical savings: GIF→MP4 ≈ 90–98%, PNG→WebP ≈ 80–95%.
