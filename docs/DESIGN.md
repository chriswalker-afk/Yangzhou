# Yangzhou: A Living Scroll — Game design specification

## Creative vision
A calm, competitive 2–4-player tile-laying game in an eighteenth-century Yangzhou inspired by Chinese painted handscrolls and by local architecture and daily life. Players jointly build a city and commit a limited set of people to enjoyable activities; completing an activity earns points and returns the person to their pool. The visual experience must reward viewing the entire city and zooming close enough to discover detailed human stories.

**Status (10 November 2026):** The camera, topology and placement prototype are retained. Active artwork is now **V2 eight-tile composition studies**, with six detailed Slender West Lake reference squares. Retired painted/crop/actor pipelines are accessible only in Git history. See [Artwork V2](ARTWORK-V2.md). This is not a complete game.

## Historical reference
- Approximate period: late Qianlong, c. 1785–1795; historically grounded artistic reconstruction rather than a literal map.
- Primary local visual reference: Yuan Yao, *Hanjiang Shenglan Tu* (1747), Palace Museum.
- Composition and miniature storytelling reference: *Along the River During the Qingming Festival* (Northern Song Kaifeng), for technique only; do not copy its architecture or clothing as Qing Yangzhou.
- Geographic landmarks: Slender West Lake (瘦西湖), Five-Pavilion Bridge (五亭桥), White Pagoda (白塔).
- The White Pagoda has a distinctive bottle-shaped stupa form, **not** a storeyed tower.
- Research Qing-era textiles, signage, food serving practices and boat types separately; do not rely on generic 'Chinese' motifs.
- The present Ge Garden's 1818 construction date falls outside this setting; avoid anachronistic depictions of that specific later garden.
- Acquire cultural/historical review before labelling assets authentic or releasing as educational history.

## Artwork pipeline status (11 November 2026)

The [V3 Living Layer System](ARTWORK-V3.md) is being explored separately from the live V2 independent-painting renderer. V3 proposes mathematically exact land/street/canal masks; shared painted ground, paving and water materials; reusable upright architectural/tree components; deterministic fine detail; and separately composited animation. Its materials are **not yet created or approved**. The current V2 documentation is archived as its own valid historical contract; do not substitute prototype geometry or flat colours for finished player-facing art.

## Art bible
- Warm rice-paper ground #EEE3CD, charcoal ink #3D403D, roof slate #68706A, muted jade water #7EA9A5, willow #849B74, clay accent #AD755D.
- Fine ink and ruled architectural lines with translucent mineral-like washes. The rendering should be a plausible eighteenth-century Yangzhou landscape with grey tiled courtyard architecture, plaster, timber, stone bridges, framed gardens, rockeries, bamboo and willows.
- Far view: readable city plan, distinctive bridges, continuous water network, lightly animated figures.
- Near view: tiny bowls, steamer baskets, tea service, footwear, carved windows, animals and individual gestures. Not merely pixel-enlarged far art.
- Sparse atmospheric motion; no synchronized loops; local crowds contrast with quiet gardens.
- Approved production art must have four compass-aligned variants or orientation-neutral layers; never simply rotate detailed characters/roofs sideways.

## Camera
- Default high, nearly overhead view; no free 3D tilt.
- Wheel/trackpad zoom anchored to cursor; touch pinch anchored to midpoint; drag and arrow keys pan; Fit returns whole city.
- Scale-adaptive rendering and asset levels of detail; high-detail source art roughly 2048px square per landmark tile, exported as optimized multi-resolution sprites.
- Gameplay interaction remains possible at any zoom. Tile hit regions must remain accurate and selection cues legible.
- Settings for full, reduced and minimal motion; honor prefers-reduced-motion.
- No abrupt zoom snaps or seams between artwork layers.

## Starter scene: six fixed tiles (3 × 2)
The canonical playable shoreline is **eight landscape perimeter edges and two navigable water exits**, with no external street exits. From north-west to south-east, N/E/S/W:
1. (0,0) Willow Garden: L L L L
2. (1,0) Northern Lake: W L W L
3. (2,0) Lakeside Gardens and Teahouses: L L L L
4. (0,1) White Pagoda Garden: L S L L
5. (1,1) Five-Pavilion Bridge: W S W S
6. (2,1) Southern Landing and Breakfast House: L L L S

The bridge is an internal east–west street crossing the north–south navigable canal; its ends terminate at the pagoda garden and breakfast-house gates. No road runs from the bridge through the natural shoreline. The two water exits lie on the north and south of the centre column. The ten outer grid positions remain candidate expansion cells. **The six displayed paintings are unapproved reference masters.** They must be retouched/checked at exterior water mouths and all bridge access points before any production-art sign-off. The exact topology in `tile-topology.js` and [Artwork V2](ARTWORK-V2.md) supersedes old templates.

## Static painting and future moving life

The eventual base paintings must contain **no embedded moving people, boats, smoke, or wakes**. People, boats, willow motion and foreground occlusion will later be separate assets whose movement obeys the actual connected street and canal graphs. The old cutout-cleanup and animation demo has been removed from the active V2 build; it was not robust enough to reuse. We should not revive it before the core painted tiles are accepted.

## Tile system
- Square orthogonal grid; all contacting edge types match after 90-degree rotation.
- Three MVP edge types: L=landscape, S=street, W=water. A connected-wall / walled-quarter subgraph is reserved for the full game.
- Roads and waterways must cross edges at their exact midpoint with standard width.
- Bridges carry separate transport graphs, even if both appear on the same tile.
- The complete game *may* eventually use thirteen or more archetypes. The **V2 artwork pilot deliberately contains only eight**: willow garden, straight paved street, street bend, market crossroads, straight canal, canal bend, small bridge and canal junction.
- The pilot uses selectable archetypes with four compass-upright composition studies each. The actual game will use independently painted original squares with carefully balanced draw probabilities, simulated for legal placement frequency.
- A placed tile should settle gently, triggering optional route animation and no exaggerated confetti.

## Turns and score (planned, not yet implemented)
1. Draw tile, rotate, place legally adjacent to existing board.
2. Optionally place one of six available people onto an eligible unoccupied activity on that newly placed tile.
3. Resolve all completed activities, score their owner(s), return people immediately.
4. End turn. When the deck is exhausted, award reduced incomplete-feature scores and compare totals.
- Morning tea: centre teahouse in completed 3 x 3 neighbourhood with street access; 10 points + up to 4 for distinct nearby amenities.
- Small tea stall: four orthogonal neighbours and street access; 4 + 2 per food neighbour (cap 8).
- Canal excursion: navigable link between visitor pier and distinct landing or Slender West Lake across >=3 water tiles; 5 + route length + 2 per traversed bridge.
- Garden visit: completed garden component; 3 points per garden tile + 2 per pavilion/pond.
- Courtyard gathering: enclosed walled compound with valid entrance; 2 per tile + 3 for internal garden.
- Leisurely stroll: connected route between distinct destinations, >=3 path tiles; 4 + path length + 2 for scenic bridge.
- Pagoda/pavilion scenic visit: completed accessible viewpoint with relevant garden/water view; 6 + 2 per scenic feature, cap 12.
- Rules require testing for ambiguity, shared features, tie resolution, component merging, cyclical routes and score-once behaviour.
- Once per game each player can recall one person from an incomplete activity without scoring.
- Visitors' scoring tokens are distinct from non-scoring ambient inhabitants.

## Life simulation
Three layers:
1. Local ambient loops — steam, willow leaves, ripples, resting animals, tea-drinking.
2. Connected journeys — boats traverse canal graph; residents traverse street graph across tile seams and bridge elevations.
3. Citywide density — connected markets/teahouses support more visitors while gardens remain calm.
- Ambient traffic has no effect on scoring. Simulated people require plausible starts/destinations and should be occluded by buildings.
- There are currently **no active ambient actors in V2**; doing animation justice requires the final artwork and connected navigation graphs first.
- End-of-game scroll tour along the water and across the finished city (future enhancement).

## Product and engineering
- Responsive browser-based client. Accessible controls, keyboard pan/zoom/rotate, reduced motion, semantic status messages.
- Prototype uses dependency-free Canvas 2D to display clearly labelled composition studies to test camera movement and mechanics before commissioning historically reviewed production assets.
- Future implementation may migrate render layers to PixiJS for atlas batching, asset streaming, layered animated characters, and stable high-density views.
- Geometry, deck, gameplay state and animation should eventually be separate deterministic modules with unit tests, saved state and seeded games.
- Gameplay must not be blocked on animation; mobile performance and memory budgets will be measured after asset import.

## Release gates
1. Camera pan, zoom, fit and scale-dependent readability.
2. Five-Pavilion Bridge and White Pagoda recognizable at default view, correct at close range.
3. Tile corners/roads/water join without gaps across rotations; no sideways architectural artwork.
4. Boat and pedestrian journeys cross actual tile seams without impossible navigation.
5. Scoring events resolve exactly once, people return to their owners, invalid placements rejected.
6. Historians / local art reviewers validate relevant historical detail.
7. Balanced, varied tile deck and full-game tests with 2–4 players.
