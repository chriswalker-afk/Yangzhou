# Yangzhou V3 Layer 2 — Courtyard Hall 01 candidate

The **first** original large-detail candidate is a transparent, compass-upright Jiangnan courtyard hall. It is separate from grass, paving, water, path verges and canal banks.

| Asset | Size | SHA-256 |
| --- | --- | --- |
| Original PNG `sources/courtyard-hall-01-original.png` | 1774 × 887, 2,099,041 bytes | `ea66d963c1f86acbda5376267d5591f6b184bd36e864048b916b3748e1bfb1f9` |
| Lossless WebP `courtyard-hall-01.webp` | 1445 × 707, 1,321,474 bytes | `3f28402dd8ba4b6cffb1fac693da4306a94631f8359f850d1ee97af8b372bc31` |

The exact derivative can be reproduced with `python scripts/prepare_v3_courtyard_hall.py` (Pillow/NumPy). Original alpha is preserved. The renderer draws the building at **96 × 47 world units**, centred on its tile-local anchor, without rotating or mirroring it. Placement excludes all exact path and water masks plus their edge treatments and additional margins. The building is never drawn outside the tile in this first proof.

[Open the independent six-tile Layer 2 composition lab](../../../layer2-lab-v3.html). It supports toggling large details, selecting tiles, changing seeds and inspecting serialized tile-local anchors.

**Review status: unapproved candidate.** Inspect whether the front-facing facade is compatible with the strict top-down overhead art direction; it may need repainting before becoming a production asset. Do not mistake the current single building for a complete architecture set, or the isolated lab for integrated V3 gameplay.
