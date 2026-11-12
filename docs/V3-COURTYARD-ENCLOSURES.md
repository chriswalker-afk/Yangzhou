# Yangzhou V3 - Courtyard Enclosure Assembly Proof

**Scope:** isolated experimental Layer 2. The playable V2 game, existing V3 geometry and current six-tile Layer 2 lab are unchanged.

**New preview:** [Courtyard Enclosure Assembly Lab](../../courtyard-enclosure-lab-v3.html?rev=30).

## Authentic artwork intake

Four user-generated paintings were prepared as cropped transparent lossless WebP sprites, preserving their original colours. Exact pixel dimensions, SHA-256 and file sizes are recorded in [manifest.json](../../assets/v3/enclosures/manifest.json). They are **not in this PR until actually uploaded**. Dashed shapes in the preview are geometry guides only, never substitute artwork.

[Upload four WebPs directly into the PR branch](https://github.com/chriswalker-afk/Yangzhou/upload/v3-courtyard-enclosure-assembly-lab/assets/v3/enclosures):

- white-garden-wall-long-01.webp
- white-garden-wall-short-01.webp
- white-garden-wall-corner-01.webp
- moon-gate-01.webp

When committed, the page automatically loads and SHA-256 verifies all four originals; until then the user can select the exact WebPs in the browser for a local-only inspection. Do not classify absent binary files as committed.

## Artwork footprints and join anchors

| Component | Footprint | Join-port offsets |
|---|---|---|
| Long wall | 70 x 12 | W (-35,0), E (+35,0) |
| Short wall | 29 x 12 | W (-14.5,0), E (+14.5,0) |
| W-to-S corner | 34 x 29 | W (-17,-3), S (+10,+14.5) |
| Moon gate | 32 x 16 | W (-16,0), E (+16,0), open north/south |

The short wall was originally proposed as 40 x 12, but its actual cropped painting aspect ratio supports about 29 x 12. The moon gate was proposed as 32 x 22, but 32 x 16 fits its image. Both changes prevent forced image distortion. Dimensions remain provisional and require assessment at normal and 3x game zoom.

## Compound construction

North chain: long -> short -> W-to-S corner.

South chain: long -> moon gate -> short.

Place Courtyard Hall 01 at (107,110) on a 220 x 220 tile, beneath the north chain and above the south chain. The moon gate is conceptually passable north-to-south, but the V3 art laboratory does not implement character movement or alter V2.

Two vertical side walls are currently **dashed proposal guides**. They are not painted artwork. A matching north-south wall and an opposite-turn corner must be commissioned as **independent orientation assets**. These four images feature facade-heavy frontal/oblique perspective. Do not simply rotate a frontal long wall 90 degrees and claim it is an overhead north-south wall.

A horizontal join is mathematically exact when the W port of the next sprite coincides with the E port of the previous sprite. Distinct terminal roof caps can still visibly double at the join; the lab exposes green join dots so we can decide whether seam-ready capless derivatives are required.

Enclosure pieces are tile-local, independent of board coordinates. Each full solid wall footprint must stay within a 10-unit tile boundary inset and outside the exact street/canal route masks, painted edge exclusion and a further 6-unit guard. An unsafe compound is rejected as a whole, not clipped through water or road.

## Review gates

1. Test both straight-joined rows at 1x and 3x; inspect roof-coping continuity and terminal eaves.
2. Compare painted walls with the existing Courtyard Hall 01, Willow Tree 01, Garden Rockery 01 and Layer 1 materials.
3. Verify land-only placement in the six-tile test and deliberate rejection on unsafe street/canal topology.
4. Evaluate overhead-game camera consistency: these images have substantial front-facing walls.
5. Paint compass-upright north-south runs and opposing corners before trying to form a truly closed compound.
6. After visual approval, implement group ownership, courtyard variants and persistent compound serialization in the V3 game model.

**Status:** candidates for human review. Neither seamless illustration nor historical accuracy is yet approved.