# Pass 2: Painted city and camera experience

## Design objective
The **default view stays high above Yangzhou**: roads, water, the Five-Pavilion Bridge and the White Pagoda read together as a historical handscroll. Players can zoom in far enough to discover small interactions and hand-rendered micro-details, without turning the game into a 3D isometric city.

## Implemented
- A coherent new tile painter in `artwork.js`: ink architectural outlines, mineral-wash texture, grey tiled roof ridges, lattice windows, rockeries, willows, blossoms, pavilions, teahouse tables, small people and gardens.
- A **bottle-form** White Pagoda silhouette and a bridge with five distinguishable pavilion roofs. These are interpretive vector illustrations, **not** yet reference-validated finished artwork.
- A water/stone palette shared across the six fixed lake tiles and the twelve selectable placement archetypes. Waterways and paths still meet at standardised edge positions, preserving the game topology.
- Canvas tiles painted as cached offscreen bitmaps. Adaptive resolution: 2x at the city scale, 4x at neighbourhood scale, and 6x at close inspection, within an approximately 18-million-pixel cache budget. Small additional details remain vector-drawn close-up.
- Viewport culling: only tiles near the visible camera region are drawn.
- Smooth exponential camera easing and three view presets: City, Street and Detail. Fit City reframes the board, zoom is anchored to pointer position, and pan works via mouse/pen/touch or arrow keys.
- Corrected touch interaction: one-finger panning/tapping and two-finger pinch zoom, without duplicate pointer event handling. Double-click zooms closer to the selected scene.
- Explore artwork mode hides placement overlays; selecting this mode never changes the placed tile state.
- Ambient improvements: differentiated miniature travellers, a canopy boat, and boat occlusion when passing under the raised Five-Pavilion Bridge.
- No external image licensing dependencies; authored procedurally in the repository.

## How to review at each scale

### City (default)
- The six-tile starting cluster must be visible at once, with surrounding parchment providing breathing room.
- Five-Pavilion Bridge forms a cross-route over the lake's north/south waterway.
- Pagoda garden is readable as a distinct white architectural landmark.
- Tile placement outlines are subdued, and can be hidden with Explore artwork.

### Street
- Roof tile strokes, stone paths, garden groupings, bridge arches and market courtyards become legible.
- A boat passes underneath the bridge without appearing on top of its walkway.

### Detail
- Individual lattices, carved rock shapes, tea dishes, small figures and willow branches become visible.
- Vector near-detail lines remain crisp while the cached texture resolution increases.
- The camera must zoom around the scene selected by the user rather than snapping back to the centre.

## Required follow-on artwork production
The project is now better illustrated but **not yet the final quality target**. The next production-art tranche should provide:
1. A locally researched, layered painting of the complete six-tile lake (one coherent composition, then divided into tile-compatible layers).
2. Architecturally reviewed detailed references for the White Pagoda, each of the five bridge pavilions, bridge arch clearance, and the Qianlong-era surroundings.
3. Authentic Qing Yangzhou shop interiors, household objects, clothing, boats and regional breakfast foods; no unverified or fabricated signage.
4. Four compass-oriented variants where needed for directional eaves, roof shadow or characters, rather than mechanically rotating finished character illustrations.
5. An asset manifest recording source/licensing, local review, layer types, colour profile, dimensions and animation anchors.

## Implementation boundaries and next phase
- `artwork.js` paints independent tiles; future production assets should use the same tile coordinates and water/street connection points.
- `ambient.js` still demonstrates a **fixed** boat and foot route across the starter scene. The next engineering pass must introduce a **dynamic route graph** rebuilt when new tiles are placed, with direction-dependent pathing, stop points and obstacle-aware drawing order.
- The proof of concept does **not** yet include player-owned people, scored activities, a randomised balanced deck, multiplayer, persistence or day/night changes.
- Follow-up visual QA should include real desktop/mobile screenshots, device performance measurements, real DPR 2+ zoom, and verification by Yangzhou historical/cultural reviewers.
