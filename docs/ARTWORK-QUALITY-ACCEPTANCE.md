# Artwork integration and visual-quality acceptance

## Changes in this pass

- Preserve all six independently painted square starting masters without adding a second procedural bridge/pagoda over their existing painted buildings.
- Remove the fake road-spur overlay from completed masters. Previously the overlay crossed finished painting details and made the tile look like a composite.
- Draw the boundary wash **once**, in the common tile painter. The lake perimeter routine may add a feature lead-in but must not wash over the same edge a second time.
- Add smoke-test regressions for these three integration errors.

## Required visual review before production art sign-off

The original source masters and topology still need dedicated art direction. The current garden tiles are cropped from larger square paintings, not newly illustrated for every legal N/E/S/W edge signature. A valid pixel seam is **not** sufficient evidence of a visually seamless scene.

Review at far overhead view and close zoom:
1. Six-square lake: roof and bridge silhouettes should appear only once. Check both internal and external seams.
2. All-ten-tile expansion ring: no repeated teahouse or identical flowering tree should be conspicuous next to itself.
3. Every rotated variant of garden pavilion, canal basin, road corner and T junction: check whether the centre-aligned edge actually leads into the illustrated street/canal, rather than fading onto a wall or lawn.
4. Mobile and desktop: inspect at native and 2x zoom for opaque collars, stretched structures, visible source-crop borders and water banks that abruptly end.
5. Ensure that no people or boats are baked into the static tile master; these should be separately animated.

## Next asset-production requirement

Commission or author dedicated, **compass-upright** square art for each needed topology (especially land gateways and canal basins). Each file should be designed from the edge contract inward, not adapted from a finished panorama. Retain 44/220 street and 88/220 canal openings at edge midpoints, with consistent banks and curbs. Once supplied, register these masters in `tile-system.js` and the tile manifest and verify a full-ring screenshot. Do not describe the current cropped tiles as final seamless artwork.
