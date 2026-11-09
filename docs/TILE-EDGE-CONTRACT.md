# Yangzhou — Tileable Painting Edge Contract

**Status:** Implemented for the starter perimeter and newly placed tiles in the Living Painting branch. Historical painting and bespoke topology-specific art remain work in progress.

## Design constraint
A tile must be both *legally placeable* and **visually tileable**.

The handscroll background may be a continuous painting inside the six fixed starting tiles, but any exposed edge must connect seamlessly to a later player-placed tile. This is a mandatory constraint, not an optional polish item.

All edges share the same contract:

| Edge type | Code | Exit position | Opening width |
|---|---|---|---|
| Landscape / garden | L | No transportation port | Full land |
| Stone street / path | S | Exact centre (110 of 220 units) | 44 units |
| Navigable water | W | Exact centre (110 of 220 units) | 88 units |

At the exact seam, all sides use the same neutral ink-and-paper land colour, road wash or canal wash. Stone curbs and banks meet at the same offsets, and no hand-painted object may obscure the connection. The 34-unit border apron transitions from canonical boundary pixels into the unique landscape illustration. Corners default to open ground so perpendicular neighbours meet consistently. Painting, rotation and the game's logical connection type are not independent choices.

## Implementation
- `edge-art.js` is the single owner of the boundary palette, width and painting transforms for N/E/S/W.
- `index.html` applies this only to the **outer perimeter** of the six fixed Slender West Lake tiles when the seamless starter painting is active. The six internal joins are not separately overpainted.
- `painted-tiles.js` uses the exact same painter on the rotatable tiles, after the cropped painted centre and edge-defined water/street routes have been drawn.
- `artwork.js` uses it as well when the image-based renderer has not loaded.
- The rules still reject any placement with a mismatched adjacent edge. A pictorial join is **never** a substitute for the actual legal placement test.

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
- A playable tile attached to the north, south, east or west edge of the starter should show a continuous junction at both overview and close-up zoom.
- A water join must have a consistent channel width and banks, not a lake abruptly terminating against garden grass.
- Streets must remain walkable across joins without a staircase, wall, canal or building cutting through the path.
- No visible internal lines should divide the six original starter painting tiles.
- Pixel-level seam regression tests compare opposite edges in both horizontal and vertical orientations. The mean maximum-channel difference must be under 14 levels; the worst isolated difference under 70. Tests must not replace manual visual QA.

## Explicit limitations
The new apron solves **border continuity**, not perfect visual storytelling several centimetres into an adjoining tile. The 34-unit transition is a bridging mechanism until hand-painted layers explicitly honour the opening widths. Source painting details near the starter perimeter sometimes still resist those geometry requirements and need artist review. A shared shape contract protects gameplay and basic continuity now; the bespoke paintings should ultimately make the patch unnoticeable.

See [Living Painting Architecture](LIVING-PAINTING.md) for the clean plate, independent walkers/boats and foreground occlusion requirements.
