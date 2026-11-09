# Yangzhou · A Living Scroll

A calm, tile-laying city-builder inspired by the everyday stories of eighteenth-century Yangzhou. The intended game combines a high, readable illustrated city view with rewarding close inspection, small ambient animations and activity-based scoring.

## Modular tile proof of concept · Pass 4

Open **index.html** in a modern browser (or host the repository as a static site). No build step, account or external runtime dependency is required. Open **tile-review.html** to inspect the independent starter artwork and a fully populated expansion ring without the game interface.

This prototype now includes:
- **Six separate square artwork files** make up the fixed Slender West Lake starting board (3 × 2). Its older panorama/clean-plate image remains a reference and sprite source, not the game map.
- **Independent animated elements:** demo boats and three painted walking residents use tile-world coordinates. Legacy bridge/willow extraction assets are preserved, but clean, per-tile foreground masks and dynamic occlusion still need an art pass.
- **Matching connectors:** one shared painter controls 44-unit street and 88-unit water openings at the exact centre of every 220-unit edge, including the five internal starter joins. All ten exterior locations have legal matching tiles and can be occupied together. A narrow paint feather standardises the seam pixels, but **does not yet guarantee visibly seamless interior artwork**.
- **Clean plate / Living city toggle:** hide or restore independent moving sprites above the square-tile board without changing the static base paintings.
- An editable/reproducible asset pipeline and QA screenshots covering the two-layer states.

This prototype includes:
- Six connected Slender West Lake **distinct square tile masters**, arranged in a **3 × 2** grid. Every fixed and placeable tile uses the shared `tile-topology.js` and `edge-art.js` rules. Some current masters recompose material from shared source paintings: they remain placeholders for six genuinely bespoke production illustrations.
- Three further full-resolution painted scenes of the Five-Pavilion Bridge, canal-side breakfast and White Pagoda Garden, inspectable from the **Paintings** button and relevant tiles in Explore mode.
- A high starting camera with smooth easing, pointer-anchored zoom, one-finger pan / two-finger pinch, keyboard pan/zoom, Fit City and quick City / Street / Detail views.
- Thirteen hand-coded tile archetypes with 90-degree rotation and exact edge matching (street, water, land).
- Valid-placement outlines, selectable spaces and a Place tile action.
- Locally stored generated artwork in `assets/tiles/` for gameplay and `assets/painted/` for historical-style concept/reference illustrations. The panorama is no longer drawn underneath the live board; the three detailed scenes remain available in the gallery.
- Newly placed, rotatable tiles share the square-master renderer and connector rules, with provisional topology-aware painting where bespoke variations are missing. Logical rotation does not turn painted buildings sideways. The procedural renderer remains a fallback.
- An Explore artwork mode that hides placement guides for unobstructed viewing, plus a separate ambient layer demonstrating journeys across the starter scene's seams.
- Toggleable motion and support for the browser's reduced-motion preference.

**Artwork acceptance is not complete.** Browser screenshots expose repeated architectural compositions and unnatural path, bank and bridge transitions just inside some joins. The shared edge geometry and asset architecture are implemented, not yet the bespoke painting standard in the visual reference. The next artwork pass should produce six clean square originals and topology-specific deck variants (1024 × 1024 minimum) before scoring, multiplayer or deck randomisation.

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

## Design and next steps
- [Full historical/art bible, map, game mechanics and architecture](docs/DESIGN.md)
- [Prototype QA checklist and honest limitations](docs/PROTOTYPE-QA.md)
- [Pass 2: camera and procedural art prototype](docs/ARTWORK-CAMERA-PASS.md)
- [Pass 3: painted asset architecture, starter topology, quality gates and future asset production](docs/PAINTED-ASSETS.md)
- [Pass 4: **Living Painting Architecture**, clean background, independent actors, occlusion and next steps](docs/LIVING-PAINTING.md)
- [Mandatory **tileable artwork-edge contract** and seam acceptance tests](docs/TILE-EDGE-CONTRACT.md)
- [One shared tile topology schema and six independent starter masters](tile-topology.js)
- [Visual artwork review studio: six-tile scene, 16-tile ring, zoom and connector overlays](tile-review.html)
- [Tile master art contract and remaining repainting tasks](assets/tiles/manifest.json)
- [Deterministic topology tests](tests/tile-topology.cjs) (`node tests/tile-topology.cjs`)
- [Painted asset manifest](assets/painted/manifest.json)
- [Dependency-free gameplay and camera smoke tests](tests/smoke.cjs) (`node tests/smoke.cjs`)

**Next:** author **six genuinely distinct, topology-matched square originals** in the approved overhead handscroll style, starting with the Five-Pavilion Bridge and neighbouring waterways. Use the [tile review studio](tile-review.html) to approve starter seams and 16-tile expansion at overview and detail zoom. Then produce additional curved/junction/dead-end masters, independent per-tile foreground masks, dynamic street/canal routes and full actor animation. Scoring and the six-person token system follow those foundations.

## Rights and reference policy
The four local WebP assets are newly generated project illustrations. The original painted references and museum photographs are research sources, not copied into the game. The imagery requires historical/cultural review before claims of authenticity; original source files and checksums are recorded in the manifest. Production artwork and any external sources must have documented usage rights.
