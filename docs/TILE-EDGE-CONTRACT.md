# Yangzhou — Tileable Painting Edge Contract

**Status:** Shared, validated gameplay-and-art geometry implemented in PR #4; six starter cells now reference six separate square tile masters. Art remains a prototype: geometry-level joins and matched boundary pixels are not proof of seamless interiors or historic accuracy.

## Design constraint
A tile must be both *legally placeable* and **visually tileable**.

The starter is **six individually authored square tile masters**, not a single panorama hidden behind a six-cell grid or six crops of one image. Every edge, including the internal five-to-neighbour joins, follows the same protocol as player-laid tiles. The original panorama remains available in the gallery only. The six masters are visually compatible prototypes; future repainting is required to remove stylistic seams a few pixels inside their edges.

All edges share the same contract:

| Edge type | Code | Exit position | Opening width |
|---|---|---|---|
| Landscape / garden | L | No transportation port | Full land |
| Stone street / path | S | Exact centre (110 of 220 units) | 44 units |
| Navigable water | W | Exact centre (110 of 220 units) | 88 units |

At the exact seam, all sides use the same neutral ink-and-paper land colour, road wash or canal wash. Stone curbs and banks meet at the same offsets, and no hand-painted object may obscure the connection. The 34-unit border apron transitions from canonical boundary pixels into the unique landscape illustration. On the starter perimeter, water ports have a translucent, tapering painted lead-in extending roughly 105 world units into the scene; they no longer terminate abruptly at the edge. Corners default to open ground so perpendicular neighbours meet consistently. Painting, rotation and the game's logical connection type are not independent choices.

## Implementation
- `edge-art.js` is the single owner of the boundary palette, width and painting transforms for N/E/S/W.
- `tile-topology.js` owns all tile definitions, N/E/S/W rotation, canonical widths, and whole-board topology validation. Every starter tile refers to a different complete square master.
- `index.html` loads the shared tile definitions and paints each starter square separately. There is **no** 3×2 backplate in the live board. Landscape, road and canal openings can exist on every side, including internal seams.
- `tile-system.js` renders both fixed and newly placed squares and applies `edge-art.js` after the art. It preserves upright architecture while rotating only the logical edge configuration. The legacy `painted-tiles.js` is not loaded by the game.
- `artwork.js` uses it as well when the image-based renderer has not loaded.
- The rules still reject any placement with a mismatched adjacent edge. A pictorial join is **never** a substitute for the actual legal placement test.

## Guaranteed expansion around the starter lake

The 3×2 starter has ten adjacent grid positions. They are **all individually legal and can all be occupied simultaneously** by actual archetypes in the prototype. These are explicit recommended matches, not hypothetical edge colours:

| Empty coordinate | Border type on lake | Suggested tile from the deck |
|---|---|---|
| (0, −1) north-west | L — garden/land | Garden pavilion (street outward) |
| (1, −1) north-centre | W — water | Mooring basin (single water port) |
| (2, −1) north-east | L — garden/land | Garden pavilion (street outward) |
| (−1, 0) western north | L — garden/land | Garden pavilion (street outward) |
| (3, 0) eastern north | L — garden/land | Garden pavilion (street outward) |
| (−1, 1) western south | L — garden/land | Garden pavilion (street outward) |
| (3, 1) eastern south | L — garden/land | Garden pavilion (street outward) |
| (0, 2) southern west | L — garden/land | Garden pavilion (street outward) |
| (1, 2) southern centre | W — water | Mooring basin |
| (2, 2) southern east | L — garden/land | Garden pavilion (street outward) |

The rotation is chosen automatically in the test. The garden-gateway examples keep a land edge against the lake and point their *single street exit outwards*, making later roads possible without putting paths through the existing painting. The mooring basin ends a canal with no forced extra water exit. These are guaranteed **available in the prototype selection palette**; a future random draw deck must be balanced separately.

Automated tests check: (a) each individual position has at least one archetype and orientation, (b) the full ten-tile ring can be placed at once with no conflicting neighbours, (c) the actual painted assets render the ring, and (d) land, street and water pixels meet in both orientations. The visual artifact `all-ten-perimeter-joins.png` gives artists a single review image.

## Production-asset standard
When commissioning a clean plate for a future tile:
1. Reserve a 34-world-unit perimeter as a connection-safe band.
2. Paint clear, unobstructed road/water exits at centre ±22 and ±44 units respectively, using the canonical land/road/water washes.
3. Preserve land corners and do not place major buildings, movable figures, boats, walls or projecting roof pieces across a port.
4. Provide a clean static base, independent foreground occluder PNGs, moving sprites and path anchors. Do not bake humans or boats into ground art.
5. A curved waterway or road is welcome *inside* the tile; its crossing at the border must be on centre.
6. Buildings may be rotated logically only when four compass-correct artwork variants exist; people and roof shadows must never rotate sideways.
7. Crossing road and water networks (bridge) have separate elevations/path graphs, not a joined route.

## Visual acceptance
- Both L–L, S–S and W–W pairs must join without a hard colour break, in all 90° orientations.
- Each of the ten surrounding cells must accept at least one actual selectable, rotated tile; the entire ring must also be fillable in one game state.
- A playable tile attached to the north, south, east or west edge of the starter should show a continuous junction at both overview and close-up zoom.
- A water join must have a consistent channel width and banks, not a lake abruptly terminating against garden grass.
- Streets must remain walkable across joins without a staircase, wall, canal or building cutting through the path.
- The six starting tiles must each be a complete square painting, and all internal seams must be checked for uninterrupted roads/canals. Their appearance is not claimed perfect until the visual acceptance pass.
- Pixel-level seam regression tests compare opposite edges in both horizontal and vertical orientations. The mean maximum-channel difference must be under 14 levels; the worst isolated difference under 70. Tests must not replace manual visual QA.

## Explicit limitations
The new apron solves **border continuity**, not perfect visual storytelling several centimetres into an adjoining tile. The 34-unit transition is a bridging mechanism until hand-painted layers explicitly honour the opening widths. Source painting details near the starter perimeter sometimes still resist those geometry requirements and need artist review. A shared shape contract protects gameplay and basic continuity now; the bespoke paintings should ultimately make the patch unnoticeable.

See [Living Painting Architecture](LIVING-PAINTING.md) for the clean plate, independent walkers/boats and foreground occlusion requirements.

## Known production-art gap (9 November 2026)

The six masters are distinct, but several were built using reworked shared sources and painterly composites. A matching pixel row on each side cannot conceal mismatched stone paths or waterbanks farther inside. Some images also contain partial paths and architecture not fully governed by the logical topology. They should be **repainted per archetype/topology at 1024×1024 or higher**, using the 44-unit road and 88-unit water edge ports as hard constraints. Preserve separate alpha masks for actors/foreground occlusion. The reference image supplied in the discussion is an **art-direction and connection-system target**, not a source asset to slice into the game.

The original Slender West Lake panorama is only a gallery reference. The live grid must remain independent if it is later removed entirely. A production acceptance screenshot should show the 3×2 starter, a mixed 16-square ring, and rotated road/canal curves at overview and close detail without smearing, tinted bands, or disconnected waterways.
