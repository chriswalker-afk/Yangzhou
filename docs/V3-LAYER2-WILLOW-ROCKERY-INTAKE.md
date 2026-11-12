# Yangzhou V3 — Layer 2 Willow Tree 01 and Garden Rockery 01

**Status: image intake prepared; painted binaries are NOT yet committed in this branch.** This branch deliberately contains no pretend sprite, and does not alter V2 or register missing images as live artwork.

The ChatGPT-authored transparent RGBA original artwork and its losslessly prepared WebP files were packaged as `yangzhou-v3-layer2-artwork-package.zip`. The reviewer should obtain the package from the ChatGPT conversation, then run:

```sh
python scripts/import_v3_layer2_artwork.py /path/to/yangzhou-v3-layer2-artwork-package.zip
```

This command checks the exact SHA-256 of each original PNG and lossless WebP **before writing**. Commit the four resulting binaries to this branch before changing the Layer 2 runtime or merging.

| Sprite | Original | Lossless WebP | Candidate visual size (220-unit tile) |
| --- | --- | --- | --- |
| Willow Tree 01 | 1254×1254, SHA `716f2e40aefb9486b3246aa91f8c2e662ca069bcab3095debf3be124448b82a2` | 1214×1229, SHA `8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e` | 48×58 |
| Garden Rockery 01 | 1536×1024, SHA `5a99b015099006be344d0f4974b8a353b4d1a1e57a7909e31d9df3e5ec278007` | 1238×815, SHA `3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89` | 52×37 |

**Further implementation needed after upload:**
- Add the two authentic WebPs to the V3 large-detail manifest and style specification with `productionApproved: false`.
- Define a willow trunk collision footprint independently of its *canopy visual footprint*; a canopy may overhang paths/water but the trunk must stay on land.
- Give rockeries a stricter solid exclusion radius; neither rocks nor a tree trunk should block a street, canal, or edge port.
- Add depth-aware rendering and repeat-avoidance, then test both sprites in six-tile Layer 2 lab at 1× and 3×, including canal junctions.
- Human-approve overhead viewpoint, common ink/watercolour palette, transparency, scale, and historical plausibility.

This is **asset preparation**, not production approval or a completed V3 renderer integration.
