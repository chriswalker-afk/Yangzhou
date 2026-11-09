# Yangzhou · A Living Scroll

A calm, tile-laying city-builder inspired by the everyday stories of eighteenth-century Yangzhou. The intended game combines a high, readable illustrated city view with rewarding close inspection, small ambient animations and activity-based scoring.

## Living Painting proof of concept · Pass 4

Open **index.html** in a modern browser (or host the repository as a static site); no runtime build step or account is required. Open **tile-review.html** to inspect the actual, full-resolution square tile paintings in the 3 × 2 Slender West Lake start or a legal 16-tile expansion.

This prototype now includes:
- **Six individually rendered square starting tiles**, with N/E/S/W connector compatibility. The earlier cleaned Slender West Lake panorama is kept as a reference source, not used as the board's background.
- **Independent transparent artwork layers:** two boats, three painted walking residents, the Five-Pavilion Bridge foreground and willow branches. Boats render beneath the bridge layer while walkers move across the bridge.
- **Tileable terrain edges:** one shared painter controls the 44-unit street and 88-unit water openings at the exact centre of every 220-unit edge, with the same geometry used by the game tile schema and independent-square renderer. All ten starter-neighbour positions have a selectable example, and the full perimeter can be filled together (eight garden gateways with streets opening outwards, two mooring basins). The natural starter painting is not cut by invented street entrances. The starter perimeter and newly placed tiles use identical boundary pixels, preserving visual compatibility after rotation.
- **Clean plate / Living city toggle:** hide or restore independent moving boats and residents on the modular tile board. The original panoramic clean plate is retained for gallery and asset reference, not drawn beneath the live six squares.
- An editable/reproducible asset pipeline and QA screenshots covering the two-layer states.

This prototype includes:
- Six connected Slender West Lake **individually authored square paintings**, arranged in a **3 × 2** grid. Every fixed and placeable tile uses the same rules in `tile-topology.js` and `edge-art.js`; the panorama is only an optional close-up reference in the gallery.
- Three further full-resolution painted scenes of the Five-Pavilion Bridge, canal-side breakfast and White Pagoda Garden, inspectable from the **Paintings** button and relevant tiles in Explore mode.
- A high starting camera with smooth easing, pointer-anchored zoom, one-finger pan / two-finger pinch, keyboard pan/zoom, Fit City and quick City / Street / Detail views.
- Thirteen hand-coded tile archetypes with 90-degree rotation and exact edge matching (street, water, land).
- Valid-placement outlines, selectable spaces and a Place tile action.
- Real painted local image assets in `assets/painted/`, with a documented manifest and no temporary CDN links. The high-resolution panorama is drawn seamlessly; the three detail paintings are used for close inspection and as feathered motifs in selected new tile designs.
- Newly placed, rotatable tiles use individual square masters where possible, with provisional topology-aware overlays for unpainted variants. Logical rotation does not turn painted buildings sideways. The procedural renderer remains a fallback until every topology has bespoke painted assets.
- An Explore artwork mode that hides placement guides for unobstructed viewing, plus a separate ambient layer demonstrating journeys across the starter scene's seams.
- Toggleable motion and support for the browser's reduced-motion preference.

**The painted artwork is integrated, but not all art is finished.** The starter lake and three detailed subjects now use real locally stored generated illustrations rather than procedural vector approximations. The composited playable tiles still require unique, fully hand-painted, topology-matching variants; cultural/historical review and polished actor animation are also outstanding. Scoring, multiplayer and deck randomisation are not implemented.

## Controls

| Input | Action |
|---|---|
| Drag canvas / arrow keys | Pan |
| Wheel, pinch, + / − | Zoom |
| Fit or City / 1 | Frame the full city |
| Street / 2 | Examine a neighbourhood |
| Detail / 3 | Inspect buildings and small painted features |
| Double click | Zoom toward the selected detail |
| Explore artwork | Hide placement guides; zoom in and select a tile to inspect the painting |
| Clean plate / Living city (or L) | Toggle between the unoccupied background and independent animated sprites |
| Paintings | Open the four detailed reference artworks and browse them |
| Gallery ← / → | Previous / next painting; Escape closes |
| Previous / Next | Choose prototype tile archetype |
| Rotate or R | Rotate clockwise |
| Click dotted space | Preview valid placement |
| Place tile | Commit chosen placement |
| Escape / Clear | Cancel preview |
| Motion on/off | Pause and resume atmospheric animation |

## Production tile-art pass (in review)
- `scripts/build_production_tiles.py` produces **58 independent 1024 x 1024 painted squares**: six fixed starting masters plus thirteen archetypes in four explicit compass orientations. Generated files are committed under `assets/tiles/production/`.
- Every square has measured centre-aligned road and water openings, with common outermost pixels and gradual painted blending inward. The tiles stay upright; only the logical route topology is rotated. Boat and pedestrian sprites remain separate from the clean ground art.
- A browser-art cache loads the correct master for the chosen and placed archetype; the previous image-composite painter remains a fallback if an image is unavailable.
- `.github/workflows/production-art.yml` generates and checks the art, and stores a **six-tile starter montage**, complete tile-deck contact sheet, and joined starter image for visual inspection.
- The source paintings are **visual studies rather than independently repainted master artwork for each topology**. The composite files still repeat roofs, landscape motifs and sometimes include unnatural, broad paving or water transitions. Neither the pixel-seam checks nor the automated screenshot suite constitute visual or historical approval.

See the [Production artwork QA & authoring contract](docs/PRODUCTION-TILE-ART.md). Review the live renderer in [**Tile artwork review**](tile-review.html): switch between six fixed squares and a 16-tile surrounding ring, zoom and toggle edge guides. The Chromium visual QA workflow saves matching screenshots.

## Design and next steps
- [Full historical/art bible, map, game mechanics and architecture](docs/DESIGN.md)
- [Prototype QA checklist and honest limitations](docs/PROTOTYPE-QA.md)
- [Pass 2: camera and procedural art prototype](docs/ARTWORK-CAMERA-PASS.md)
- [Pass 3: painted asset architecture, starter topology, quality gates and future asset production](docs/PAINTED-ASSETS.md)
- [Pass 4: **Living Painting Architecture**, clean background, independent actors, occlusion and next steps](docs/LIVING-PAINTING.md)
- [Mandatory **tileable artwork-edge contract** and seam acceptance tests](docs/TILE-EDGE-CONTRACT.md)
- [One shared tile topology schema and six independent starter masters](tile-topology.js)
- [Six-tile and 16-tile artwork review studio](tile-review.html)
- [Whole-board topology and rotation regression tests](tests/tile-topology.cjs)
- [Painted asset manifest](assets/painted/manifest.json)
- [Dependency-free gameplay and camera smoke tests](tests/smoke.cjs) (`node tests/smoke.cjs`)

**Next:** replace the most visibly repeated tile composites with **genuinely bespoke square paintings** obeying the same centred edge rules. Prioritise the White Pagoda, Five-Pavilion Bridge, road crossings, canal crossings and corner turns, then inspect assembled layouts at 1× and detail zoom in the tile-review studio. Add per-tile occlusion layers and connected actor paths before activity scoring, six-person pools and turn rules.

## Rights and reference policy
The four local WebP assets are newly generated project illustrations. The original painted references and museum photographs are research sources, not copied into the game. The imagery requires historical/cultural review before claims of authenticity; original source files and checksums are recorded in the manifest. Production artwork and any external sources must have documented usage rights.
