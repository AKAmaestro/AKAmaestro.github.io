# akamaestro.com

Portfolio & personal reflection site of Ankit Kumar Agrawal (AKAmaestro).
Plain static multi-page site on GitHub Pages — no build step.

> **Editing the site? Read [`MANUAL.md`](MANUAL.md)** — an in-depth, page-by-page
> guide to changing content, colours, the charts, and everything else. Every
> editable spot in the source is also flagged with an `EDIT HERE` comment.

## Structure

| Path | What |
|---|---|
| `index.html` | Homepage — personality dashboard, work grid, explore tiles |
| `about.html` / `journey.html` / `signals.html` / `arcade.html` | Section pages |
| `resume.html` / `showreel.html` | Inline PDF viewers |
| `work/*.html` | One page per project, each with its own genre aesthetic |
| `vault.html` | Password-gated area (AES-256, client-side decryption) |
| `assets/css/core.css` + `assets/js/core.js` | Shared design system & runtime |
| `projects/` | Media (originals + optimized `.webp`/`.mp4` variants) |
| `tools/` | Media optimizer + vault encryptor (see `tools/README.md`) |
| `Archive/` | Previous site versions |

## Workflows

- **Add media:** drop originals into `projects/<name>/`, run
  `tools/.venv/bin/python tools/optimize_media.py --all`, reference the
  generated `.webp`/`.mp4` files (see `tools/README.md`).
- **Update the vault:** copy `tools/vault.config.example.json` to
  `tools/vault.config.json` (gitignored — it holds the passwords), edit,
  then run `tools/.venv/bin/python tools/encrypt_vault.py tools/vault.config.json`.
  Commit only the generated `assets/vault-data.json` (ciphertext).
- **Theme a page:** override the CSS custom properties from
  `assets/css/core.css` (`--bg`, `--accent`, `--font-display`, …) in the
  page's own `<style>` block.
