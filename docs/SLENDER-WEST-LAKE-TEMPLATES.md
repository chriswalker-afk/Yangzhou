# Slender West Lake — canonical six-square layout and art templates

**Decision:** Natural shoreline, eight land exits and two north/south navigable-water exits. No external road exits. The Five-Pavilion Bridge is an **internal east–west pedestrian route**, not a road from the lake to the outer city. The bridge connects a western pagoda garden gate to an eastern breakfast-house gate. The water passes north–south beneath it, never joining the street graph.

## Plan view (north at top)

| x=0 | x=1 | x=2 |
| --- | --- | --- |
| (0,0) Willow Garden — LLLL | (1,0) Northern Lake — WLWL | (2,0) Lakeside Teahouses — LLLL |
| (0,1) White Pagoda Garden — LSLL | (1,1) Five-Pavilion Bridge — WSWS | (2,1) Southern Landing and Breakfast House — LLLS |

Signatures are **N/E/S/W**. The centre-column water is continuous. The street at the east side of the pagoda tile joins the bridge's west side, and the bridge's east side joins the west side of the breakfast-house tile. Those streets terminate **inside their respective destination tiles**; the outer shoreline remains land.

### Explicit artistic composition
- Willow Garden: willows, rockery, quiet garden paths; no external transport opening. Do not depict the old north–south paved road.
- Northern Lake: north–south 88-unit water channel; gentle banks and a scenic view anchor.
- Lakeside Teahouses: buildings and local footpaths entirely inside the square, no painted road crossing its exterior. Teahouse requires future access logic; do not imply it already scores via a street connection.
- White Pagoda Garden: accurate bottle-shaped pagoda, gate at east-centre leading to bridge, path terminates at pagoda viewpoint. All three other edges are land.
- Five-Pavilion Bridge: 88-unit north–south navigable channel beneath a 44-unit east–west elevated pedestrian bridge. Water and street graphs **never** join here.
- Southern Landing and Breakfast House: bridge walkway enters from west-centre and terminates at the breakfast-house gate. Do not paint roads on north/east/south edges. A decorative landing is **not** a navigable canal pier without a separate water connection.

## Template usage
Each `assets/templates/*.svg` is a **220×220 world-unit** layout guide, with a 34-unit border-safe apron, exact centred ports, route centre-lines, and anchor markers. SVGs are planning guides, not production paintings. Paintings should be authored at 1024px or 2048px, compass upright; export separately with transparent foreground and animation masks. Keep static boats, walkers and steam off the base layer.

## Artwork migration warning
The six existing WebP masters are still provisional. Four are explicitly marked `artStatus: 'requires-repaint'` in the topology because their original streets no longer match the canonical natural shoreline. **Do not claim visual readiness until the master art is replaced.** The renderer still uses the old masters as placeholders; they can visibly contradict the new logical routes until the art pass.

## Validation gates
1. Every adjoining edge agrees with its neighbour; the outer perimeter contains exactly 8 L and 2 W.
2. No S port appears on the outer perimeter. The bridge's street ports end at real destinations.
3. No street-water transfer at the bridge. Any future landing must add an explicit access anchor.
4. Every square is a complete individual painting, never a crop from a 3×2 image.
5. All ten outer ring cells remain legally placeable in at least one compatible arrangement; preserve the natural shore when testing mixed archetypes.
6. Full-board overview and zoomed detail screenshots show neither false roads nor cut-off paths.
7. Score eligibility remains driven by the scoring graph, not painted proximity. In particular the isolated northern teahouse cannot earn street-access points until the rules explicitly permit a connection.

## Next
Replace the six provisional master paintings using these templates, then commission reusable road-end, garden gate, canal bend and basin archetypes. Once art matches the contract, build the gameplay scoring engine and simulate complete games.
