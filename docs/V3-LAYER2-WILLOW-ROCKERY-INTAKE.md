# Yangzhou V3 Layer 2 — Willow and Rockery Intake Complete (PR #27)

The user uploaded both **authentic transparent lossless WebP sprites** directly to the `v3-layer2-willow-rockery-intake` branch. Both match the exact SHA-256 and Git blob hashes of the generated originals' prepared derivatives. **The artwork is now committed, not merely staged.** No V2 game asset or renderer was changed.

| Component | File | Committed bytes | SHA-256 |
| --- | --- | --- | --- |
| Willow Tree 01 | `assets/v3/large/willow-tree-01.webp` | 2,044,912 | `8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e` |
| Garden Rockery 01 | `assets/v3/large/garden-rockery-01.webp` | 1,223,626 | `3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89` |

### Run QA

```sh
python scripts/import_v3_layer2_artwork.py
node tests/v3-layer2.cjs
```

The image loader in `assets/v3/layer2-placements.js` now loads all three authentic candidates: Courtyard Hall 01, Willow Tree 01, Garden Rockery 01. `layer2-lab-v3.html?rev=29` automatically renders them in independent 220×220 placeable squares alongside the already accepted candidate grass, paving, water and painted edging.

### Rules

- All asset placement anchors are tile-local and deterministic from seed and edge topology. Moving a tile does not change its component composition.
- A willow has a small protected land-only solid trunk and a larger canopy permitted to overhang routes (but not adjacent tile boundaries in this proof).
- A rockery and a hall have full footprint protection; all components avoid visual collision.
- All three remain `productionApproved:false`. Committed binaries and passing QA are **not** evidence of historical, stylistic or scale approval.
- The Willow and Rockery original PNG sources are preserved in ChatGPT, not in this repository. The two exact prepared WebPs are verified and available without external downloads.

### Visual review

[Combined Layer 2 six-tile lab](../layer2-lab-v3.html?rev=29) · [Existing Layer 1 materials and edging lab](../layer-lab-v3.html?rev=25) · [Live playable V2 game](../index.html)

Look for fidelity of willow fronds against the continuous water texture, overlap with canal banks, rockery scale and shadows, hall roof consistency, component repetition and density. Change the seed of a selected tile and zoom to 3×.
