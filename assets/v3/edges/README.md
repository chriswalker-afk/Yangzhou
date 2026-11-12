# Canal Bank Edge 01 — committed painted candidate

The real transparent Jiangnan ink-and-watercolour canal-bank artwork is committed as `canal-bank-edge-01.webp`. It is **not yet production-approved**. The isolated V3 lab automatically loads it and overlays it on both canal banks without widening the navigable water core.

## Verified candidate file

- Path: `assets/v3/edges/canal-bank-edge-01.webp`
- File size: **632,080 bytes**
- Dimensions: **2172 × 226 RGBA**, VP8L lossless WebP
- SHA-256: `ffbb109f2c44c2ab122299b973cc0fc6358a9486beefc1a9c358cf351eb7bdf5`
- Source PNG: `watercolour_canal_bank_tile.png`, 2172 × 724
- Source SHA-256: `cbef6e2ffad92e8a8171a944694ace9e498a7be97397de16f5a9bbe6fe048862`
- Preparation: remove alpha below 5, crop source y=239..465, 72px symmetric seam blend, export lossless WebP.

The new `tests/v3-bank-art.cjs` verifies the committed binary's exact SHA-256, byte count, WebP lossless signature, dimensions, alpha flag and manifest linkage. Any missing or substituted file fails CI. Existing V2 remains untouched.

## Visual review

Open `layer-lab-v3.html` after PR merge or from a static server on this branch. The candidate should appear automatically. Use **Hide painted-bank candidate**, **Hide temporary edging**, the geometry selector and 3× zoom to compare straights, bends, junctions and bridge. The local PNG/WebP picker is for temporary revision comparisons only.

**Still needs human review:** horizontal repetition, painting stretching at bends, stone scale relative to paving, waterline orientation, bridge overlap, colour and top-down perspective. Do not treat green tests as artistic approval.
