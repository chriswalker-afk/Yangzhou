# Yangzhou V3 — Painted Courtyard Wall Materials

## Wall Roof-Tile Texture 01

**First painted Layer 2 wall material candidate.** It is an independently generated, near-orthographic Jiangnan/Yangzhou slate/charcoal grey ink-and-watercolour tile-coping painting. It is a **repeatable texture**, not a straight wall, corner, terminal cap, or moon gate illustration.

Source PNG (2508×627 RGB) is preserved in ChatGPT and has SHA-256 `731df70b0143848f3c1f0bc4b0c51e3d845fa7f09ca16cab8b2bba339853dd39`. The prepared WebP is 1256×314 pixels, **174,360 bytes**, SHA-256 `8a3a7abeb08c4e34bb0134c9a39ba301000435bed5d3c63ccad3bd7a949e578a`.

The prepared derivative is gently normalized at its left/right boundaries, using a symmetric correction over only the outer 60 pixels; this is a **seam candidate**, not yet proof of a perfect painted transition at every camera zoom. See `scripts/prepare_v3_wall_roof_tiles.py` for exact source steps. This preserves the painting's physical roof-tile detail while preventing a visible large colour step in horizontal repeats.

**Binary integrated:** the exact 174,360-byte painted WebP is now committed to `assets/v3/wall-materials/wall-roof-tiles-01.webp`, Git blob SHA-1 `724b075426f0e6fa2688a03e7ac366c50567a124`. The new lab loads and SHA-256 verifies it automatically. If a network request fails, the lab falls back to diagnostic grey and offers a local file selector; it never draws fake painting.

[View the committed painted candidate](https://github.com/chriswalker-afk/Yangzhou/blob/main/assets/v3/wall-materials/wall-roof-tiles-01.webp)

## Renderer

The isolated V3 lab uses `assets/v3/wall-roof-texture.js` to map the single painting onto continuous wall centrelines:

- Material width: exactly **8 world units**.
- Texture U period: exactly **32 world units** (4:1 painting).
- Texture V: perpendicular distance across wall.
- Texture phase continues along a path's accumulated arclength, not along the overall board x/y coordinates. A segment can turn 90 degrees without changing tile scale.
- Connected L-corners use geometrically **mitered clip polygons** so adjacent painted bands cannot expose grass. The image tile pattern may still need a deliberately painted corner-cap or junction texture to perfect the tile motifs.
- At T-junctions, the separate branch meets the continuous main coping band without a gap in the underlying grey geometry.
- Genuine moon-gate openings still cut through **all** wall bands. Painted coping cannot cover the gap.
- The original hall remains compass-upright; geometry is tile-local and preserves Layer 1 geometry. The V2 game is untouched.

**QA:** `node tests/v3-wall-roof-texture.cjs` and `node tests/v3-wall-roof-texture-visual.cjs` (the latter uses Playwright and a local server). These verify the exact committed file length, SHA-256 and Git provenance; the original source PNG remains separately preserved outside the repository.

This is candidate-only until reviewed at **1× and 3×**, with focus on roof-tile scale, grey palette relative to Courtyard Hall 01, the L-corner tile join, the T-junction and the visible moon-gate ends.

## Ivory Plaster 01 and Stone Foundation 01 (rev 39)

The original generated paintings are incorporated into the isolated V3 laboratory as two SHA-verified lightweight WebP derivatives. The masters were not modified and remain accessible as the original images in the ChatGPT conversation. Both derived WebPs are real user-selected artwork; no procedural substitute or dummy painting was committed.

- `wall-plaster-ivory-01.webp`: 1256×314, 56,950 bytes. Warm weathered ivory Jiangnan lime plaster, original source `yangzhou_ivory_watercolour_plaster.png` (2508×627). Full face uses a natural 4:1 repeat.
- `wall-stone-base-01.webp`: 1256×157, 69,958 bytes. One course cropped from the top half of the original two-course source `weathered_yangzhou_stone_wall_texture.png` (2508×627). The single course better fits a 1.7-world-unit narrow foundation, using a natural 8:1 repeat length of 13.6 world units.

Both are horizontally repeatable: the outer 8% of pixels is softly adjusted to align colour across the left/right boundary without repainting the interior stones or plaster. Source SHA-256, prepared SHA-256 and Git blob hashes are recorded in `manifest.json`.

The `wall-face-materials.js` painter maps each surface strictly to **south/east-facing wall geometry**. There is no plaster on the upper/northern hidden face, no texture in genuine gate gaps and no resizing of entire wall images to suit particular straight lengths. All turns stay camera-orientated; vertical surfaces reuse the same strip rotated −90°.

Artwork status: **visual review candidates only**. Check the apparent block scale and plaster shading at 1× / 3× next to the existing courtyard hall, particularly at the southeastern corner and along the moon-gate jambs. Production approval remains pending. The playable game and previous V3 labs are unchanged.
