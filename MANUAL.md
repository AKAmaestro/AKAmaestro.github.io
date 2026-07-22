# akamaestro.com — Editing & Authoring Manual

An in-depth guide to changing anything on this site. It is a plain static
multi-page site on GitHub Pages — **no build step, no framework, no npm.** You
edit HTML/CSS/JS files directly and refresh the browser.

> **Golden rule:** most "content" edits are just editing a **data array** or a
> repeated **HTML block**. The drawing/animation code underneath rarely needs to
> change. Every editable spot has an `EDIT HERE` comment in the source — this
> manual explains each one.

**Contents**
1. [How the site is put together](#1-how-the-site-is-put-together)
2. [The design system (colours, fonts, theming)](#2-the-design-system)
3. [Global pieces: nav, footer, dropdown, loading bar](#3-global-pieces)
4. [Common tasks](#4-common-tasks)
5. [Page-by-page reference](#5-page-by-page-reference)
6. [The scripts (core.js) reference](#6-the-scripts-corejs-reference)
7. [Media pipeline & the vault](#7-media-pipeline--the-vault)
8. [Before you push: verify checklist](#8-before-you-push-verify-checklist)

---

## 1. How the site is put together

| Path | What it is |
|---|---|
| `index.html` | Homepage — hero, ticker, **works treemap**, contact |
| `about.html` | Bio + the **Focus Field** interactive skills chart |
| `journey.html` | Career timeline — **vertical** git-log view (static HTML) |
| `journey-h.html` | Career timeline — **horizontal** map view (JS, data-driven) |
| `signals.html` | Awards, press, leadership (static HTML) |
| `arcade.html` | 14 playable itch.io game cabinets (JS, data-driven) |
| `blog.html` | Writing (currently placeholder drafts) |
| `vault.html` | Password-gated area (client-side AES-256) |
| `resume.html`, `showreel.html` | Inline PDF viewers |
| `work/*.html` | One page per project, each with its own genre look |
| `404.html` | Not-found page |
| `assets/css/core.css` | **The shared design system** — every page loads it |
| `assets/js/core.js` | **The shared runtime** — every page loads it |
| `projects/` | All media (originals + optimised `.webp`/`.mp4`) |
| `tools/` | Media optimiser + vault encryptor (see `tools/README.md`) |

**Every page has the same skeleton:** `<nav class="site-nav">` → `<div class="frame">` (content) → `<footer class="site-footer">` → `<script src="assets/js/core.js">`. The nav and footer are copied into each page's HTML (there is no include system), so a nav/footer change made to the *markup* must be repeated per page — but styling and behaviour come from the shared `core.css`/`core.js`, so those you change once.

---

## 2. The design system

All colours, fonts and spacing come from **CSS custom properties** defined at the top of `assets/css/core.css`:

```css
:root {
  --bg / --panel / --hover / --line / --line-dim   /* surfaces */
  --text / --dim                                     /* ink */
  --accent / --accent-rgb                            /* the neon-green brand */
  --font-ui      (Space Grotesk)  /* nav, headings, values, buttons */
  --font-body    (Manrope)        /* body copy */
  --font-code    (JetBrains Mono) /* labels, tags, paths, code */
  --font-display (Fraunces)       /* big display + quotes */
}
body.light-mode { …the same tokens, re-defined for light theme… }
```

**To recolour the whole site,** change `--accent` / `--accent-rgb` (and the light-mode ones). Everything that references them updates.

**To theme one page differently** (like the pink arcade or the amber Signals), override the tokens inside *that page's* own `<style>` — e.g. arcade.html starts with `:root { --accent:#ff2d95; --bg:#06000d; … }`. Don't fork core.css.

**The three-voice type rule** (keep it consistent): display/quotes = Fraunces, UI/labels-that-are-headings = Space Grotesk, code-flavoured labels/tags/paths = JetBrains Mono, body prose = Manrope.

---

## 3. Global pieces

- **Nav bar** — copied into every page. The links are plain `<a>`. The **crumb** on the left (`©AKAmaestro / PAGE`) shows "you are here"; set its `<span>` per page. Below **1200px** the whole nav collapses to a burger **sheet** automatically (injected by `initMobileNav`).
- **Work dropdown** — the "Work" link becomes a hover/tap mega-menu listing all projects. Its contents come from the **`WORKS` array at the top of `core.js`** — edit there, once, and it updates on every page. First tap on touch opens it; second tap (or a menu item) navigates.
- **Footer** — copied into every page (`<footer class="site-footer">`): brand blurb, a **Connect** column of SVG social icons, and a **Map** column of page links. To add a social icon, copy an `<a>` in `.f-icons` and give it an SVG + `aria-label`.
- **Loading bar** — the thin green bar at the very top on navigation is automatic (`initNavProgress`); no markup needed.

---

## 4. Common tasks

### Add / change a work project (homepage + nav dropdown)
Two places, both simple:

1. **Homepage treemap tile** — in `index.html`, copy a `<a class="work-item" …>` block inside `<main class="works">`. Set:
   - `href="work/yourproject.html"`
   - `data-weight="12"` → **tile size = importance.** Bigger number = bigger tile. (Amnesea is 30, KeyBound 22, small ones 6.) The treemap re-packs automatically with no gaps at any count.
   - the `<img class="bg">` or `<video class="bg">` (use an optimised `.webp`/`.mp4` from `projects/`)
   - the `.label`, `<h2>`, and `.h-sub` text
2. **Nav dropdown** — add a line to the **`WORKS` array in `core.js`**: `{ title:'Your Project', tag:'Category', href:'work/yourproject.html' }`.
3. Create the actual `work/yourproject.html` (copy an existing work page as a template — they share the layout and just swap content + the `<style>` theme tokens).

### Change the rotating job titles (hero)
`index.html` → the `roles = [ … ]` array in the TYPEWRITER script.

### Change the scrolling ticker
`index.html` → the `#ticker-track` markup. Wrap a phrase in `<b>…</b>` to accent it green. Write each item **once** — the JS duplicates it for a seamless loop.

### Add media
Drop originals into `projects/<name>/`, run the optimiser (§7), then reference the generated `.webp`/`.mp4`. Use `data-lazy preload="none"` on background `<video>` so it only loads near the viewport.

### Recolour / re-theme
See §2.

---

## 5. Page-by-page reference

### Homepage — `index.html`
- **Hero:** name (glyph-reveal animation), typewriter role line, the big *"I build playful machines…"* statement, then the `EXPLORE WORK` button. Edit the statement text directly; edit roles in the typewriter array.
- **Ticker:** see §4.
- **Works treemap:** the `<main class="works">` tiles. Tile area is driven by `data-weight`. The squarified-treemap layout is computed in the `WORKS TREEMAP` script at the bottom of the file — you never edit the algorithm, only the tiles/weights. On phones (≤700px) it falls back to a stacked grid automatically.
- **Contact strip:** the email link at the bottom.

### About — `about.html`
- **Bio:** the `.bio-grid` prose (Fraunces editorial voice) + the cut-out photo.
- **Focus Field** (the big skills chart): **fully documented by a `HOW TO CUSTOMISE` comment block right above the `<div id="focusfield">`** and inline comments on the data. In short — it's one unified visual (gradient E/D/M domain fields + radar rings + force-directed skill nodes). **To add a skill, append one line to the `NODES` array** in the script at the bottom: `{ id:'unique', z:'ED', label:'New Skill' }`. Zones: `E`/`D`/`M` (single), `ED`/`EM`/`DM` (overlaps), `C` (core, add `core:1`). Domain colours are the `--vE/--vD/--vM` vars in the page `<style>`. Phones show the `.venn-cards` region cards instead (edit those too if you change the data, so mobile matches).
- **Off the clock / Toolbelt / Coordinates:** plain HTML chip lists — edit inline.

### Journey — `journey.html` (vertical) and `journey-h.html` (horizontal)
Two views of the **same career**; keep them in sync when you add an entry.
- **Vertical (`journey.html`)** is **static HTML** — one `.commit` block per entry, documented by the `EDIT HERE` comment above `.repo-log`. Copy a block, set the lane colour (`--lane`), the `.when`/`.c-title`/`.c-org`/`.c-brief`/`.c-tag` text, and (optionally) a `data-pop-src="#pop-ID"` + a matching `<template id="pop-ID">` at the bottom for the "+ THE FULL STORY" popup.
- **Horizontal (`journey-h.html`)** is **data-driven** — documented by the `EDIT HERE` comment above the `LANES` array. Times are **decimal years** (`2024.5` = mid-2024, `NOW` = ongoing). Append to `BARS` for a role, `MARKS` for a milestone dot, `LINKS` for a branch curve between lanes.

### Signals — `signals.html`
Static HTML, three lists (documented by the `EDIT HERE` comment above the trophy wall): **awards** (`.award`, `data-size` sets its treemap span sm/default/full, `data-pop-*` is the story), **press** (`.mention-card` with a logo + Fraunces quote), **leadership** (`.press-card`). The showcase strip at the bottom is a horizontal-scroll image row.

### Arcade — `arcade.html`
Data-driven from the **`GAMES` array** (documented by the `EDIT HERE` comment above it). One object per cabinet: `{ name, account, url, embedId, c1, c2, tagline }`. `embedId` is the number from your game's itch.io **Embed** dashboard. The playable widget loads itself lazily — nothing else to wire.

### Blog — `blog.html`
Currently placeholder "drafting" cards. Replace a card's content with a real post (or link out). If you ship a real post, remove the dashed "draft" styling on that card.

### Vault — `vault.html`
Password gate. **You do not edit the page to change what's inside** — the secret content and passwords live in `tools/vault.config.json` (gitignored). See §7 and the comment at the top of the vault script.

### Resume / Showreel — `resume.html`, `showreel.html`
Inline PDF viewers. To swap the document, replace the referenced PDF file and update the `href`/`src`. (Current: `Ankit Resume Design Copy.pdf`, `projects/Ankit Kumar portfolio draft.pdf`.)

### Work pages — `work/*.html`
Each is a self-contained case study with its own `<style>` theme tokens at the top (genre-specific fonts/colours) and shared components (nav, gated deep-content, prev/next pager, footer). To add one, **copy the closest existing work page** and swap content + theme. Deep content is intentionally blur-gated (`.gate-zone`) and unlocks with a vault key.

### 404 — `404.html`
On-brand not-found page with recovery links. Rarely needs editing.

---

## 6. The scripts (core.js) reference

`core.js` is one IIFE. **Its top-of-file comment is a full map of every function.** Everything is wired in the `DOMContentLoaded` handler at the bottom — **comment a line out there to disable a feature site-wide.** Highlights you might touch:

- **`WORKS`** (top of file) — the project list for the nav dropdown. *This is the one data array in core.js you edit.*
- **`toggleTheme()`** — global, called by every `.theme-btn`. Persists to `localStorage`.
- **`openPop(title, html)` / `[data-pop]`** — the popup engine. Any element with `data-pop` opens a card; the body is `data-pop-body="…"` or the innerHTML of a `<template>` named by `data-pop-src="#id"`.
- **`initWorkDropdown` / `initMobileNav` / `initNavProgress`** — nav behaviour (dropdown, burger sheet ≤1200px, loading bar).
- **`vaultTryUnlock` / `initVaultTab`** — the encryption gate (see §7).

Per-page charts (**treemap** in index.html, **Focus Field** in about.html, **timeline** in journey-h.html, **cabinets** in arcade.html) live in each page's own inline `<script>`, right where their data is — each is commented in place.

---

## 7. Media pipeline & the vault

**Media** (from `tools/README.md`):
```bash
# drop originals into projects/<name>/, then:
tools/.venv/bin/python tools/optimize_media.py --all
# reference the generated .webp / .mp4 (not the heavy originals)
```

**Vault** — change the secret content or passwords:
```bash
cp tools/vault.config.example.json tools/vault.config.json   # first time (gitignored)
# edit tools/vault.config.json: the passwords + the HTML each key unlocks
tools/.venv/bin/python tools/encrypt_vault.py tools/vault.config.json
# commit ONLY the regenerated assets/vault-data.json (ciphertext)
```
The passwords never enter the repo or the served pages. Different keys can unlock different tiers of content.

---

## 8. Before you push: verify checklist

There's no build to catch mistakes, so sanity-check by hand:

1. **Open the page(s) you changed** in a browser (and toggle light/dark, and narrow the window to phone width) — the site has no error page for a broken layout.
2. **Tag balance** — an unclosed `<div>` silently breaks layout. A quick check:
   ```bash
   python3 - <<'PY'
   from html.parser import HTMLParser
   VOID={'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
   class C(HTMLParser):
       def __init__(s): super().__init__(); s.st=[]; s.err=[]
       def handle_starttag(s,t,a):
           if t not in VOID: s.st.append(t)
       def handle_endtag(s,t):
           if t in VOID: return
           if not s.st or s.st[-1]!=t: s.err.append(f'</{t}>')
           elif s.st: s.st.pop()
   for f in ['index.html','about.html']:  # ← the files you touched
       c=C(); c.feed(open(f,encoding='utf-8').read())
       print(f, 'errors:', c.err, 'unclosed:', c.st)
   PY
   ```
3. **Smoke test** — `python3 -m http.server` then load each page; watch the browser console for red errors (a broken data array shows up here).
4. **Keep the two Journey views in sync** if you added a career entry.
5. **Commit** with a clear message. Only push/merge to `master` (the live branch) when you mean to go live.
