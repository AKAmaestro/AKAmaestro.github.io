# Layout Guide

This page uses a **10-column CSS grid** with compact row units.
- Grid is defined in `index.html` under `.dashboard-grid`:
  - Columns: `repeat(10, 1fr)` — change `10` to adjust column count.
  - Row height: `grid-auto-rows: minmax(60px, auto)` — raise/lower `60px` to change tile height.
  - Flow: `grid-auto-flow: row dense` — keeps tiles packed in order.

## Tile placement
Each tile sets its position via custom properties:
```css
.area-portfolio {
    --grid-col: 1 / span 2;  /* start / span across columns */
    --grid-row: 5 / span 1;  /* start / span down rows */
}
```
- Edit `--grid-col` / `--grid-row` on a tile to move/resize it.
- `grid-column: 1 / -1` means full-width (used for header, hero, separator, works, contact).

## Current layout (desktop)
- Header: row 1 full width.
- Hero/Bio: rows 2–4 full width.
- Row 5 (1×1 tiles): Showreel (col 1–2), Skills (col 5–6), Resume (col 3–4), Research (col 7–8), Proof/Signals (col 9–10).
- Row 6: Career (col 1–2), Awards (col 3–4), two sample void blocks (col 5–6 and col 7–8) you can delete or move.
- Separator: row 7 full width.
- Works gallery: rows 8–13 full width; project cards auto-flow inside.
- Contact: row 14 full width.

## Adding a new tile
1) Add the panel in the HTML near other tiles:
```html
<div class="panel area-new hover-trigger" onclick="openModal('new')">
  <span class="label">NEW <span>+</span></span>
  <div><h2 class="h-title">New Tile</h2><span class="h-sub">Description</span></div>
</div>
```
2) Add its CSS block with placement:
```css
.area-new {
    --grid-col: 2 / span 2;
    --grid-row: 6 / span 1;
    background: rgba(50, 50, 90, 0.8);
    position: relative;
}
```
3) (Optional) Add a modal entry in the `db` object if it should open content.

## Changing grid size
- Columns: update `grid-template-columns` (e.g., `repeat(12, 1fr)`).
- Row height: update `grid-auto-rows` (e.g., `minmax(80px, auto)`).
- Reposition tiles by adjusting their `--grid-col` / `--grid-row`.

## Mobile behavior
- Under 720px, the grid uses a single column (`grid-template-columns: 1fr`), and each panel spans full width.
- Heights flow from content; no manual spans needed on mobile.

## Inline comments added
- Key CSS blocks now include comments for grid positioning.
- Sample comments mark where to edit spans and optional void blocks.
