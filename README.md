# Yangzhou · A Living Scroll

A calm, tile-laying city-builder inspired by the everyday stories of eighteenth-century Yangzhou. The intended game combines a high, readable illustrated city view with rewarding close inspection, small ambient animations and activity-based scoring.

## Camera and art proof of concept · Pass 2

Open **index.html** in a modern browser (or host the repository as a static site). No build step, account, external dependency or network connection is required.

This prototype includes:
- Six fixed Slender West Lake starter tiles, including a stylised Five-Pavilion Bridge and bottle-shaped White Pagoda.
- A high starting camera with smooth easing, pointer-anchored zoom, one-finger pan / two-finger pinch, keyboard pan/zoom, Fit City and quick City / Street / Detail views.
- Twelve hand-coded tile archetypes with 90-degree rotation and exact edge matching (street, water, land).
- Valid-placement outlines, selectable spaces and a Place tile action.
- A richer, layered ink-and-wash procedural renderer: detailed roofs, lattice screens, rockeries, blossom trees, willow branches, garden enclosures, teahouse details and boat scenes. Adaptive 2x/4x/6x detail caches and viewport culling support close inspection.
- An Explore artwork mode that hides placement guides for unobstructed viewing, plus a separate ambient layer demonstrating journeys across the starter scene's seams.
- Toggleable motion and support for the browser's reduced-motion preference.

**This is a painterly proof of concept, not final authentic artwork.** Current artwork is generated with Canvas 2D primitives, not commissioned or historically vetted painted assets. Boats and pedestrians traversing newly placed routes, activity scoring, multiplayer and deck randomisation are planned but not implemented.

## Controls

| Input | Action |
|---|---|
| Drag canvas / arrow keys | Pan |
| Wheel, pinch, + / − | Zoom |
| Fit or City / 1 | Frame the full city |
| Street / 2 | Examine a neighbourhood |
| Detail / 3 | Inspect buildings and small painted features |
| Double click | Zoom toward the selected detail |
| Explore artwork | Hide placement guides; click to inspect a tile |
| Previous / Next | Choose prototype tile archetype |
| Rotate or R | Rotate clockwise |
| Click dotted space | Preview valid placement |
| Place tile | Commit chosen placement |
| Escape / Clear | Cancel preview |
| Motion on/off | Pause and resume atmospheric animation |

## Design and next steps
- [Full historical/art bible, map, game mechanics and architecture](docs/DESIGN.md)
- [Prototype QA checklist and honest limitations](docs/PROTOTYPE-QA.md)
- [Pass 2: detailed camera and art decisions, limitations, and production-art handoff](docs/ARTWORK-CAMERA-PASS.md)
- [Dependency-free gameplay and camera smoke tests](tests/smoke.cjs) (`node tests/smoke.cjs`)

**Next:** review and integrate production-grade, historically validated Yangzhou painting assets, then develop a **dynamic transport graph** for boats and residents across newly placed tiles. Afterwards, build the turn manager, six-person pools, activity completion rules and score-once tests.

## Rights and reference policy
All Canvas illustration code here is newly authored for this project. Historical images and paintings referenced in the design documentation are *research references*, not embedded in the game or assumed to be license-free. Production artwork and any external sources must have documented usage rights.
