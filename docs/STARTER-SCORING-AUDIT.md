# Slender West Lake starter audit — scoring and painting freeze

**Status:** Six starting tiles audited against the current *actual* `tile-topology.js`. This is an audit and proposed correction, not a silent replacement of the playable start or its artwork.

## Current topology and internal graph
| Tile (x,y) | N/E/S/W | Internal scoring route | Destination / scenery |
| --- | --- | --- | --- |
| Willow Causeway (0,0) | S L S L | north–south street | none |
| Northern Lake (1,0) | W L W L | north–south water | lake viewpoint |
| Lakeside Gardens and Teahouses (2,0) | S L S L | north–south street | teahouse |
| White Pagoda Garden (0,1) | S S S L | north/east/south street junction | scenic pagoda |
| Five-Pavilion Bridge (1,1) | W S W S | north–south water; east–west street, **separate** | scenic bridge |
| Southern Market Crossroads (2,1) | S S S S | four-way street | food market |

All five internal contacts between the 3×2 tiles match. The six tile definitions have distinct full-square art references. The new scoring schema validates each declared external port and rejects undeclared transport exits.

## Conflict with intended original scene

The original design document describes **eight landscape perimeter edges and two water exits**, so that the historical lake can expand naturally into gardens without invented roads cutting through the starting scene. The currently live six tile definitions instead expose multiple road exits (including the market crossroads). This is not a cosmetic discrepancy: it changes where walks can start, which roads must be drawn and which neighbouring tiles can legally be placed.

The current art and game can continue functioning, but these six squares should **not be signed off for final painting** until this conflict is resolved.

## Recommended canonical direction (pending art implementation)

Keep the centre-column north/south canal and the separate east–west pedestrian bridge. Preserve the pagoda and teahouse as **destinations reached from the bridge** rather than as mandatory exterior roads. Remove unnecessary external road ports from the perimeter, replacing them with land. Any newly added road terminus should be drawn as an intentional garden gate, market forecourt or courtyard entrance with a defined internal anchor.

Important constraint: removing street exits is not equivalent to deleting the pedestrian route. Internal routes from the bridge to the pagoda/teahouse must remain connected through suitable anchors. If the north row no longer has a street exit, its current north–south street cannot remain an edge-to-edge street; it needs a destination-terminated internal path instead.

### Proposed next decision
Adopt the original natural-lake perimeter as the final art target, or explicitly approve a more urban start with multiple external streets. Do **not** change the live topology until its new internal graph and all ten surrounding candidate placements have been tested together.

## Acceptance before commissioning the paintings
1. Fix exact N/E/S/W signatures for all six starter squares and rerun full-ring legality checks.
2. Place an internal street, water, destination, garden and wall anchor overlay on each square.
3. Ensure every visible road leads to another port, a junction, or a named destination; every water port leads to navigable water.
4. No unconnected painted streets, impassable bridges, decorative walls mistaken for enclosure or water terminating in dry land.
5. Confirm that the six-square composition and a ten-square expansion ring look natural at overview and close zoom.
6. Keep all human/boat animation on separate layers.

## Implementation notes
`scoring-tile-spec.cjs` currently describes the **actual playable starter** rather than the recommended future rework. This preserves legal placement until the starter art direction is approved. It is a rules-and-asset contract, not an executable scoring engine.
