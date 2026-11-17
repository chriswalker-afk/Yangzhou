# V3 stone bridge — exact Layer 1 footprint proof (2026-11-17)

The newest user-approved stone-bridge painting replaces the previous bridge candidate in **V3 preview only**.

## Geometry contract

- Tile: 220 × 220 world units, WSWS signature (canal north/south; road east/west).
- Vertical canal width **88**; east–west street width **44**.
- Bridge centre **(110,110)**. Bridge deck **x=66..154 (88 long)** and **y=88..132 (44 wide)** in local tile coordinates.
- The street approaches stop at the canal banks. **No road or stone paving is drawn under the bridge artwork.** The canal-water material remains continuous beneath the transparent portions of the painting; the bridge image supplies its own painted stone deck, with no opaque fallback rectangle.
- Clip decorative painting to the 88×44 deck. Preserve the world-space material repeat and all underlying water, bank, road and gameplay geometry outside the bridge mask.
- Source: `assets/v3/large/sources/stone-bridge-parapets-01-original.png` (1774×887 source, unchanged).
- Lossless pixel-identical WebP: `assets/v3/large/stone-bridge-parapets-01.webp`.
- Previous bridge remains recoverable in Git history; this is not a gameplay replacement or an art certification.

## Visual review

Open [connected 4×4 review](../layer2-seven-new-assets-v3.html#bridge-proof). The new close-up is cropped from the same 4×4 canvas; its optional dashed 88×44 overlay is a diagnostic, not part of the artwork.

Check **both road seams**, **canal edges above/below the bridge**, **painted rail alignment**, and **desktop/mobile legibility** before art approval. Do not widen either route just to fit an art asset. If the painted railing is perceptually too wide, repaint the art, not Layer 1.
