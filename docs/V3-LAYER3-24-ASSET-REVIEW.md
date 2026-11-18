# Yangzhou V3 — Layer 3, complete 24-asset visual review

**Status:** original painted artwork candidates; not certified or approved for production. This PR does not change the playable V2 game or any accepted Layer 1/2 material or geometry.

## Asset catalogue

| Family | Assets |
| --- | --- |
| Garden/natural | Moss Clumps 01–03, Fallen Willow Leaves 01–02, Plum Petals 01, Wildflower Clusters 01–02, Small Stones 01, Small Pebbles 01 |
| Courtyard/domestic | Ceramic Flower Pots 01–02, Earthenware Water Jar 01, Wooden Bucket 01, Bamboo Planter 01 |
| Street/market | Woven Basket 01, Stacked Wicker Baskets 01, Wooden Goods Box 01, Rolled Woven Mat 01, Tea / Produce Containers 01 |
| Canal/waterside | Reed Clusters 01–02, Floating Lotus Leaves 01, Stone Mooring Point 01 |

Total **24** distinct transparent WebP candidates in `assets/v3/fine/`. The definitive inventory, PNG source metadata, candidate footprints and prepared file hashes are recorded in `assets/v3/fine/manifest.json`.

**Corrected mooring point:** only the **standalone stone bollard with rope and base** has been committed. Reject previous variants containing floor slabs or painted canal water; do not include them as gameplay assets.

## How to review

The complete review is in **`layer3-fine-details-v3.html`**. Run a static web server from the repository root, then open the page (it deliberately reuses the 5×5 scene from `layer2-all-assets-v3.html`, rather than a fake replacement).

1. Toggle Layer 3 on/off to compare the real 25-tile scene.
2. Zoom to 1× and 3×, and highlight an individual painted asset from the 24-item selector.
3. Inspect the seven crops: plum, willow, courtyard, market, bank, floating lotus, and mooring post.
4. Look at street/canal junctions, the original painted 88×44 bridge, walls, real gates, landings and thin 28-unit streets. There must be no unintended overpainting or clipped edges.

## Placement invariants

- V3 road **28 world units**, canal **88 units**; tile size **220×220**.
- Base paintings (grass, paving, water) remain unchanged.
- Decoration positions are tile-local and reproducible from tile seed.
- Do not overlap any road, canal, solid wall, gate opening, existing Layer 2 art or another detail.
- Water-only lotus is contained **inside the existing canal**, at safe distances from banks and roads; never under the painted bridge.
- Reeds and the stone mooring post are placed **on dry canal banks**, not in the water.
- Original first-eight placements are retained. New detail placements may be omitted if no safe space remains on a crowded tile; the QA requires every one of the 24 types to appear somewhere.
- Full-resolution original PNGs remain preserved for follow-up editing separately from the committed game-scale WebPs. Asset approval remains manual.

## Automated review

- `node tests/v3-layer3.cjs`: checks 24 matching IDs and exact SHA-256, WebP alpha/dimensions, 25 valid tiles, 24 unique used types, collisions, canal-bank policies, deterministic placement and V2 unchanged.
- `node tests/v3-layer3-visual.cjs`: Playwright browser screenshots and real on/off pixel changes on desktop/mobile; proves seven crop views and 1×/3× zoom.
- Existing Yangzhou V2/V3 smoke and browser suites are also run by GitHub Actions.

**Approval gate:** review the CI screenshots and connected interactive lab before merging; neither image hashes nor automated smoke checks certify visual quality.
