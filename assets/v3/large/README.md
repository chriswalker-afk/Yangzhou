# Yangzhou V3 Layer 2 — Large Detail Artwork Candidates

Three authentic transparent painterly sprites are now committed to the **isolated V3** component library. The live playable V2 game remains unchanged.

| Art candidate | Game-ready transparent WebP | SHA-256 | World dimensions |
| --- | --- | --- | --- |
| Courtyard Hall 01 | `courtyard-hall-01.webp` (1445×707; 1,321,474 bytes) | `3f28402dd8ba4b6cffb1fac693da4306a94631f8359f850d1ee97af8b372bc31` | 96×47 |
| Willow Tree 01 | `willow-tree-01.webp` (1214×1229; 2,044,912 bytes) | `8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e` | 48×58 |
| Garden Rockery 01 | `garden-rockery-01.webp` (1238×815; 1,223,626 bytes) | `3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89` | 52×37 |

All three are lossless VP8L RGBA; all are artwork **candidates pending visual and historical approval**.

## Source provenance

Courtyard Hall 01's original RGBA PNG is preserved at `sources/courtyard-hall-01-original.png`. Its preparation is reproducible using `scripts/prepare_v3_courtyard_hall.py`.

Original PNG masters for Willow Tree 01 (1254×1254, SHA `716f2e40aefb9486b3246aa91f8c2e662ca069bcab3095debf3be124448b82a2`) and Garden Rockery 01 (1536×1024, SHA `5a99b015099006be344d0f4974b8a353b4d1a1e57a7909e31d9df3e5ec278007`) were created in ChatGPT and **are not yet committed to this repository**. The exact lossless WebP versions were uploaded to the PR by the user and verified against the preparation hashes. Source status is accurately indicated in `manifest.json`; do not claim otherwise.

Verify all authentic uploaded image binaries with `python scripts/import_v3_layer2_artwork.py` and `node tests/v3-layer2.cjs`.

## Placement and rendering

All components have tile-local anchors on an individual independently movable **220×220** tile; their bitmaps are never rotated by a road/canal topology change.

- **Courtyard hall**: full 96×47 footprint must avoid routes, painted edges and tile boundaries.
- **Willow tree**: full 48×58 canopy stays within the tile's boundary, but **only the 7-unit-radius trunk** has to be clear of water/street and protected banks/verges. Semi-transparent foliage can overhang navigable ground without changing connectivity.
- **Garden rockery**: full 52×37 solid footprint must avoid all street and water routes, painted edges and tile boundaries.
- All auto-placement is deterministic from **tile seed + N/E/S/W topology**, not global board x/y. Explicit placements are validated, including collisions between large details.

[**Open the six-tile combined V3 Layer 2 lab**](../../../layer2-lab-v3.html?rev=29) to compare the three candidates against existing grass/stone/water material and painted edges. Choose the connected road/canal neighbourhood, three-way canal junction or all-land garden; inspect at 1×/3×, select and reseed individual tiles, or toggle each sprite class independently.

**Review needed:** artwork density, willow overhang/occlusion, hall roof perspective, Taihu rockery silhouette, shadows, common ink-and-watercolour palette, and repetition across 6-tile layouts. A passing CI test does not grant production approval.
