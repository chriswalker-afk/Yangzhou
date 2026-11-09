# Yangzhou scoring rules — design freeze for artwork, version 1

**Status:** Authoritative proposed rule contract for tile art and future gameplay. The seven activities are not yet executable scoring features. Numeric choices below preserve the original proposal, with ambiguities resolved for implementation; playtesting can revise balance without changing topology.

## Turn and ownership
2–4 players, six scoring people per player. On a turn draw, rotate and legally place one tile; optionally place one available person on one unclaimed eligible activity introduced or extended by that tile. People are attached to an activity **ID**, not to a painted sprite. Resolve completed activities after placement; score once, return all people on the completed activity, then end the turn. Ambient residents do not claim features.

An activity is claimed when its first person is assigned. A player cannot place a person on an already claimed activity. If two claimed components later merge, both existing claims persist and score when the combined activity completes. Each player with a claim receives the full feature score (cooperative tie, no majority calculation). A person cannot be reassigned except for one free recall per player per game (recall gives zero points). All scoring events have stable IDs and a scored flag; merging cannot rescore a completed feature.

At deck exhaustion, incomplete claimed activities award **floor(half of their currently earned base-and-bonus score)**, except an activity missing its minimum eligible route length or access requirement scores zero. No additional people can be placed on an activity already scored. Completion is evaluated on the newly placed board, never on visual proximity alone.

## Feature and network definitions
- **Street** and **water** are independent graphs. Each matching edge joins one port to the opposite port. Internal paths connect only where the tile schema declares connections; crossing paths on a bridge remain disconnected across elevations.
- A road is not completed simply by reaching a destination; the **stroll activity** is completed when two distinct eligible destination anchors become connected by a continuous walkable path of at least three *distinct tiles*. A destination can be a terminus or a stop on a through-road. Only one shortest eligible route between the two nominated anchors counts, chosen by fewest tiles, then deterministic coordinate order. No tile can contribute twice to a route.
- A water excursion connects a **visitor pier** to a different **landing** or a Slender West Lake destination via a navigable route of at least three distinct water tiles. No port may be blocked by a painted bridge pier or quay. Bridges traversed by water count as scenic bridge bonuses only once.
- A closed garden is a maximal connected garden component whose exposed orthogonal boundaries are explicitly closed by garden fence, wall or garden-land boundary metadata; ordinary L–L terrain continuity does not imply that gardens connect.
- A courtyard compound is complete when its walled perimeter forms an unbroken enclosure with one or more accessible street-linked gates. Walls are a separate boundary graph; S and L edge types alone do not close a courtyard.
- A scenic viewpoint is complete when its viewpoint anchor is reachable by street and at least one designated garden or water view anchor is present in its declared sight neighbourhood (orthogonal adjacent tiles or the tile itself). Scenic features are distinct IDs, counted once.
- A 3×3 teahouse neighbourhood is complete when all nine positions are occupied and the central teahouse has a connected street access anchor. Distinct amenities in the eight surrounding positions give +1 each, maximum 4.
- A small stall is complete when all four orthogonal neighbours are occupied and the stall has street access. Food amenities in those neighbours give +2 each, capped at four neighbours (+8).

## Scoring formulas
| Activity | Complete when | Points |
| --- | --- | --- |
| Morning tea | 3×3 occupied; street-accessible centre teahouse | 10 + min(4, distinct amenity categories in ring) |
| Small tea stall | Four neighbours occupied; street access | 4 + 2×min(4, food-amenity neighbours) |
| Canal excursion | Pier to different landing/lake destination, >=3 distinct water tiles | 5 + water tile count + 2×distinct scenic bridges traversed |
| Garden visit | Garden boundary closed and component connected | 3×garden tiles + 2×pavilion/pond anchors (distinct) |
| Courtyard gathering | Complete wall loop and at least one connected gate | 2×enclosed compound tiles + 3 if internal garden present |
| Leisurely stroll | Two distinct street destinations, >=3 distinct path tiles | 4 + path tile count + 2 if scenic bridge traversed |
| Scenic visit | Accessible pagoda/pavilion with eligible view anchor | min(12, 6 + 2×distinct scenic view anchors) |

## Completion and art rules
Road ends **must be explicit**: a one-port road terminus ends at a drawn gate, courtyard, plaza or path destination, never in blank grass. A canal end requires a navigable basin, landing or natural enclosed water terminus. An open street/water port on a tile edge is never an endpoint.

Garden boundaries must be visually represented by wall, fence, hedge or garden water boundary; do not infer them from the green ground wash. Compound wall/gate segments are tracked separately from the land/road/water edge type. A bridge must expose two unconnected graph layers (pedestrian bridge above, water below) and two corresponding drawn routes.

## Edge cases to test before gameplay release
- A 3-tile route that loops back to its own starting destination does not score.
- A bridge with road and water crossing has no pedestrian-to-boat transfer unless an explicit landing anchor exists.
- A completed activity scores only once after a later tile extends or merges its network.
- Two previously claimed route components merge: both owners score once when completed.
- A garden with a gap in its boundary cannot score, even if surrounded by land tiles.
- A walled compound with no usable entrance cannot score.
- A pier-to-pier journey without a different landing/lake destination cannot score.
- Two visually adjacent but logically disconnected road segments cannot score.
- One road network may contain several distinct destination-to-destination stroll activities, each with its own ID and scoring claim; duplicate endpoint pairs are disallowed.

## Scope
These are **rule specifications**, not claims that scoring, token management, routing or wall-loop algorithms already run in the game. Future balancing should be driven by seeded full-game simulations.
