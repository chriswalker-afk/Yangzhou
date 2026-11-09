# Yangzhou · A Living Scroll

A calm, tile-laying city-builder inspired by the everyday stories of eighteenth-century Yangzhou. The intended game combines a high, readable illustrated city view with rewarding close inspection, small ambient animations and activity-based scoring.

## Painted Slender West Lake prototype · Pass 3

Open **index.html** in a modern browser (or host the repository as a static site). No build step, account, external dependency or network connection is required.

This prototype includes:
- Six connected Slender West Lake starting tiles arranged in a **3 × 2** grid; a single continuous handscroll-style WebP painting covers the full starter scene without internal grid seams.
- Three further full-resolution painted scenes of the Five-Pavilion Bridge, canal-side breakfast and White Pagoda Garden, inspectable from the **Paintings** button and relevant tiles in Explore mode.
- A high starting camera with smooth easing, pointer-anchored zoom, one-finger pan / two-finger pinch, keyboard pan/zoom, Fit City and quick City / Street / Detail views.
- Twelve hand-coded tile archetypes with 90-degree rotation and exact edge matching (street, water, land).
- Valid-placement outlines, selectable spaces and a Place tile action.
- Real painted local image assets in `assets/painted/`, with a documented manifest and no temporary CDN links. The high-resolution panorama is drawn seamlessly; the three detail paintings are used for close inspection and as feathered motifs in selected new tile designs.
- The previous procedural renderer remains available as a fallback and still supplies the exact street/water/land connection geometry for rotatable, newly placed tiles.
- An Explore artwork mode that hides placement guides for unobstructed viewing, plus a separate ambient layer demonstrating journeys across the starter scene's seams.
- Toggleable motion and support for the browser's reduced-motion preference.

**The painted artwork is integrated, but not all art is finished.** The starter lake and three detailed subjects now use real locally stored generated illustrations rather than procedural vector approximations. The full deck of rotatable tiles still requires individual painted, topology-matching variants; cultural/historical review and polished actor animation are also outstanding. Scoring, multiplayer and deck randomisation are not implemented.

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
| Paintings | Open the four detailed local artworks and browse them |
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
- [Painted asset manifest](assets/painted/manifest.json)
- [Dependency-free gameplay and camera smoke tests](tests/smoke.cjs) (`node tests/smoke.cjs`)

**Next:** draw **topology-aware painted variants** of the 12 playable tile archetypes to match the starter painting, then build a **dynamic transport graph** and painterly moving person/boat sprites. Afterwards, add player pools and activity scoring. Afterwards, build the turn manager, six-person pools, activity completion rules and score-once tests.

## Rights and reference policy
The four local WebP assets are newly generated project illustrations. The original painted references and museum photographs are research sources, not copied into the game. The imagery requires historical/cultural review before claims of authenticity; original source files and checksums are recorded in the manifest. Production artwork and any external sources must have documented usage rights.
