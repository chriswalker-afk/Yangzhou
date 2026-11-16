# Yangzhou V3 — New Layer 2 painted artwork batch (rev 48)

**Status: original PNG and lossless WebP assets committed in PR #47, candidate visual review, not production integration or V2 release.**

This batch incorporates five separately generated paintings into the same reusable object library as Courtyard Hall 01, Willow Tree 01 and Garden Rockery 01. They are **not** screenshots, whole tile paintings, or colour placeholders. The original generated PNG files are preserved in `assets/v3/large/sources/`. Each is cropped at alpha threshold 20 and converted to lossless VP8L WebP, with unchanged painted colours. Full hash, byte count, footprint and source record are in `assets/v3/large/new-candidates-manifest.json` and the shared `assets/v3/large/manifest.json`.

| Asset | World dimensions | Typical use | Notes |
| --- | --- | --- | --- |
| Garden Pavilion 01 | 52×52 | Quiet garden focal building | Painted roof, open timber, stone steps; inspect scale against existing hall |
| Bamboo Grove 01 | 62×45 | Garden planted cluster | Foliage may overlap other art visually, roots/rocks require land |
| Garden Rockery 02 | 60×41 | Ornamental Taihu stone and blossom | Keep structural rock footprint off paths and walls |
| Courtyard Wing 01 | 33×87 | Narrow side building | North–south ridge; **do not rotate the bitmap**, even when gameplay topology rotates |
| Waterside Landing 01 | 95×47 | Canal frontage / landing architecture | Original illustration contained background and its own water; an automatic alpha mask was applied to prepare a separate sprite. **Manual shore-edge/embedded-water review remains mandatory**; do not stamp across existing canal edges |

## Browser preview

`layer2-new-assets-v3.html` renders six independent 220×220 squares using the actual source images automatically. Each new WebP is fetched from the review branch and checked against the exact SHA-256 of its approved-for-review preparation; if missing/modified, it is not replaced with fake art. The existing Courtyard Hall 01 is the sixth scale-reference component. Toggle between garden and connected street/canal scenes, inspect the original at 3× zoom, and optionally load the separate artwork ZIP for local comparison. No changes to `tile-topology.js`, the original Layer 1 masks, playable V2, or the previously accepted wall/roof/moon gate painting.

This is an **artwork-intake gallery**, not yet a unified placement implementation. The current `assets/v3/layer2-placements.js` still knows only the three previously authored objects; these five remain registered review candidates. Before use in the tile generator, merge all large details, continuous walls, real gate corridors and Layer 1 traffic exclusions into one occupancy model. In particular, design a separate waterline interface for the landing rather than relying on its prepared alpha mask as a replacement canal bank.

## Acceptance checklist

1. Compare every asset at 1× and 3× against the original Courtyard Hall and the actual muted grey roof-tile, stone, timber and ground textures.
2. Confirm no object image is rotated to follow topology; check Courtyard Wing 01 ridge remains north–south.
3. Test non-overlap with the real 30-unit moon-gate passage, 12-unit courtyard walkway, wall foundation, hall footprints and protected 44-unit street / 88-unit canal mouths.
4. Inspect the waterside landing at the canal-water material boundary. This candidate includes painted vegetation and water in its source, so it may need to be split into stone landing / waterline / optional vegetation/boat components before production.
5. Confirm all image assets remain tile-owned, seed-deterministic, compass upright, and placed only when their route/exclusion geometry allows.
6. Keep **productionApproved:false** until these are visually approved. Green browser/Node tests certify file correctness and preview mechanics, not art quality or historical accuracy.

The next recommended engineering step is the unified Layer 2 occupancy/placement pass, followed by integration of these candidates individually.
