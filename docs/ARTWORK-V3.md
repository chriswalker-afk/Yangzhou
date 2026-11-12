# Yangzhou Artwork V3 — The Living Layer System

**Status: experimental proposal. Three painted material candidates (grass, stone, water) have been accepted for review, not production-approved. The live V2 renderer is not replaced.**

**Material pilot / merged PR #20:** The original accepted grass, stone and canal-water candidate WebPs are now committed in [`assets/v3/materials/`](../assets/v3/materials/), with [checksummed manifest](../assets/v3/materials/manifest.json) and [integrity instructions](../assets/v3/materials/README.md). The [six-tile material lab](../layer-lab-v3.html) loads them automatically; optional file selectors allow local comparisons. The mandatory material test verifies all three binary hashes, sizes and dimensions. **Visual seam, style and history review is still required before production approval.**

This is the proposed successor to the independent full-square-painting workflow described in [ARTWORK-V2.md](ARTWORK-V2.md). The V2 rules remain valid for V2 images and tests; they do **not** prohibit carefully constructed geometry, reusable textures, transparent sprites or animation in V3.

## Why V3

Full-tile image generation has produced attractive individual scenes but inconsistent grass, water and stone colours, off-centre or incorrectly sized road/canal exits, inconsistent shadows, and recognisable seams. Rather than correcting individual paintings repeatedly, separate geometry (machine-exact) from surface treatment and decoration (artist-authored).

**Artwork rule:** geometry determines where roads, water and land connect; shared painted materials and individually assembled details determine how they look.

## Keep from V2

- Keep the gameplay camera, placeable tile grid, scoring specifications, six original Slender West Lake reference squares, archived original artwork, and the current variant gallery.
- Keep `tile-topology.js` as the single source of truth for the eight archetypes, their rotations, and the 20 distinct N/E/S/W signatures.
- Keep existing V2 tests, manifests and image hashes working until the replacement has separately passed acceptance.
- Never physically rotate an asymmetric building, roof, text, person or other compass-upright detail simply because its geometry rotates.

## Four layers (bottom to top)

1. **Base geography** — reusable, palette-locked grass/earth, stone paving and water surfaces. Shapes come from exact topology-driven masks; water and street mouths are not guessed by image generation. Shoreline stone and road kerbs follow those masks. Bridge base has a separate continuous canal graph beneath a continuous street graph.
2. **Large details** — transparent, depth-aware reusable *components*: courtyard walls, roofs, gates, trees, bamboo, pavilions, bridges and rockeries. Use component families and different arrangements, not cloned whole houses stamped at fixed locations.
3. **Fine details** — tiny transparent sprites or deterministic generated accents such as moss, leaves, flowers, cracks, tiles, pottery, soft shadows and local reflections. No decoration may introduce an unplanned road or navigable water exit.
4. **Animation** — separately composited subtle water ripples, windblown leaves, drifting petals, willow/bamboo motion, and eventually walkers and boats. Animation must respect scene depth and the actual street/water connectivity. Support reduced motion and pausing when out of view.

Static layers 1–3 may be precomposed or cached into a single texture per tile/seed to keep the running game efficient. Animation remains independent, and foreground occluders can be drawn separately when needed.

## Canonical topology geometry

The canonical coordinate square is **220 × 220 world units**. N/E/S/W edge symbols: `L` = land, `S` = street, `W` = water. Draw shapes in local tile coordinates but sample repeating world textures from global board coordinates so neighbouring tiles share the same material phase.

| Edge type | Exact centred opening | Edge range | At 1254 px |
| --- | --- | --- | --- |
| Land `L` | No street/water | none | none |
| Stone street `S` | 44 / 220 = 20% | 40–60% | approx. 502–752 px |
| Canal `W` | 88 / 220 = 40% | 30–70% | approx. 376–878 px |

Use the relevant axis: horizontal position on north/south edges; vertical position on east/west edges. The full aperture includes the visible paved or water material, not just the centreline. Pixel tests allow at most one pixel for rasterisation/antialiasing; canonical vector geometry has **zero** tolerance.

- The centre of every entry/exit is at 110 world units along its edge.
- Each connected route is continuous inside the tile; a three-way water junction connects **all three** channels.
- End tangents are perpendicular to tile edges; only matching materials exit at defined port intervals.
- Curbs/banks and their highlights must continue naturally across legal seams without adding additional water/road mouths.
- Bridge art: the water runs continuously *under* the street deck. The elevated deck and balustrades form an overlay; bridge navigation stays as two distinct graphs.
- Rotating gameplay topology changes these paths, not the orientation of reusable buildings or characters.

The first, deliberately plain geometry study is in [base-geometry.js](../assets/v3/base-geometry.js). It is **not** intended to be a finished visual material or a revival of V2's low-quality vector artwork.

## One consistent visual language

The initial palette and material slots are specified in [style-spec.json](../assets/v3/style-spec.json). Its colours are provisional seed values derived from the project's existing art direction, **not** automatically approved.

Production assets must share:

- Strict overhead/orthographic perspective; buildings and trees compass-upright.
- Jiangnan/Yangzhou late-Qianlong historical research and plausible proportions; no generic fantasy temples.
- Same light direction and soft ambient shadow convention; shadows anchored to their objects.
- Comparable ink-line weight, saturation, brush grain, rendering scale and detail density.
- No global colour correction per tile. Material colour choices are made once for the library; individual tiles vary through placement, lighting accents, and subtle interior-only material detail.
- Reuse visible at the material/component level, but prevent recognisable repetitions of complete compositions. Maintain several component variants and spacing/exclusion rules.
- Paint a few intrinsically unique landmark assets separately; the reusable kit should not erase Yangzhou's distinctive places.

## Texture production rule

Start with **three** seamless source materials: grass/earth, paved stone and muted jade water. Test each alone at 1× and 3×, then in adjoining tiles. Sample tiled textures using *world-space* coordinates (including a stable scene seed), not a newly restarted texture origin on each tile. Break obvious texture repetition with deterministic interior detail; do not disguise discontinuities with painted border strips or blur.

Source textures and sprites should have an asset manifest with width/height, colour space, alpha-channel expectation, provenance, checksum, and review status. Until approved assets exist, the manifest must not pretend placeholder colours are final artwork.

## Layer 1B — geometry-following edge system (PR #21)

This is **geometry infrastructure only**, not a painted border asset or a production-quality art pass. The [six-tile laboratory](../layer-lab-v3.html) now offers six studies: connected east/west roads and canals, a connected street bend, a connected canal bend, a footbridge, a three-way canal junction and a four-way street junction. Hide/show temporary edge colours, show port guides and inspect at 3×.

- The original **44/220 street** and **88/220 canal** surface masks remain unchanged. Edge treatments occupy surrounding *land*, never widen the navigable openings or create a route on a land-only edge.
- The edge model is constructed from the same centreline, tangent and normal as the route. Two sides of each ribbon share exact cross-sections at a port, regardless of the direction in which neighbouring tiles compile their routes.
- Temporary path verge: **2.5 world units outward per side**, with **0.8 units** of contact rim near paving. Temporary canal bank: **4 units outward per side**, with **1.2 units** of contact rim near water. The proposed bridge deck uses the path dimensions with a different placeholder colour, drawn over the continuous canal.
- **No artist-made edge strip has been created or approved.** Current verge, bank and contact-rim colours are flat diagnostic fills in `assets/v3/edge-system.js`. The [style spec](../assets/v3/style-spec.json) labels each as `temporary-geometry-only` with `asset: null`; they must never masquerade as painted materials.
- The page retains committed grass/stone/water materials and samples them continuously in global board coordinates. We offset ribbon vertices, not the Canvas transform or material pattern, so tile joins do not reset texture phase.
- Unit tests inspect all 20 topology signatures, the exact edge cross-sections, adjoining-tile agreement, orthogonal edge tangents, junction layering and bridge draw order. The browser workflow captures actual desktop/mobile review screenshots and comparison with edging switched off.
- The preview has **not** been visually approved. Curved edge-strip UV mapping, painted kerbs/banks, soft shadows, decorative overlap, naturally irregular outlines and bridge parapet artwork belong to later art passes.

**Visibility diagnostic (rev 22):** The six-tile lab shows an explicit `Edging ON/OFF` state. Provisional canal-bank and waterline-rim colours were made more contrasting so the narrow 4-unit land-side strips can be located clearly. Browser tests sample actual upper/lower canal-bank pixels with edges on and off; a missing bank is now a CI failure rather than merely a subtle difference. These are **flat, non-artistic diagnostic colours** and are not a substitute for the next painted-bank asset. To distinguish cached preview HTML, check that the heading includes `rev 22`.

**Next review gate:** Inspect edge continuity and thickness in the five basic geometries at 1× and 3×, then produce **one canal-bank painted strip** in the project's muted ink-and-watercolour language. Test it on a straight canal and bend before commissioning the path-verge strip. Keep the first painterly asset as an independently approved candidate, not a hidden code-generated substitute.

## Canal Bank Edge 01 — painted candidate intake (pending binary)

The Canal Bank Edge 01 painting was generated as an RGBA PNG with original dimensions **2172 × 724** and SHA-256 `cbef6e2ffad92e8a8171a944694ace9e498a7be97397de16f5a9bbe6fe048862`. The painting is **not production-approved**. Its processed, lossless transparent WebP has now been committed with an exact SHA-256/size/dimension integrity contract. Never substitute a procedural or remotely queried image and call it the accepted source.

A dedicated [painted-bank adapter](../assets/v3/canal-bank-art.js) paints the land-side canal ribbons using tangent/normal geometry. For tests and human review the [V3 lab](../layer-lab-v3.html) can read the original candidate PNG **locally**, without uploading it. The actual WebP is committed at `assets/v3/edges/canal-bank-edge-01.webp` and the page loads it automatically. World-aligned grass, paving and water remain unchanged, and bridge decks render above the bank overlay.

**Required before final artwork approval:** visually inspect the committed file at 1×/3×, prove repeatable seams and corner behaviour, and inspect whether perspective, linework and painted bank thickness match the overhead materials. CI verifies SHA-256, size, VP8L transparency and dimensions but cannot grant artistic approval. Keep V2 unchanged.

## Path Verge Edge 01 — painted path boundary candidate

The original, user-selected `2172 × 724` transparent PNG is preserved under `assets/v3/edges/sources/path-verge-edge-01-original.png` (SHA-256 `9e8b458c04d2af39a0c4df1bf1c059b3532526958676c736f139edbc0828557f`).

The derived **1992 × 194** lossless transparent WebP at `assets/v3/edges/path-verge-edge-01.webp` (SHA-256 `5c99dfe5bf64ed71190a32246eec656f7df7561714045f0a984b3c25fe23e249`) retains the original painting but removes empty margins and blends 112 pixels on each horizontal end to join at identical edge pixels. Exact dimensions, alpha and hashes are mandatory CI checks.

`assets/v3/path-verge-art.js` applies the asset to both land-side boundaries of **non-bridge** stone-paving geometry. Temporary verge geometry remains 2.5 world units outside the road; artist-painted grasses can extend up to **5 units landward** for visual legibility. This **does not change the exact 44/220 road opening** or the tile topology. Road cores are redrawn at junctions after decorative overlays to keep crossing roads clear. Bridges use the separate deck treatment, with no grass clumps on stone parapets.

The [six-tile V3 lab](../layer-lab-v3.html) loads painted canal banks and path verges simultaneously, offers independent paint toggles and local comparisons, and exposes straights, bends, junctions and bridge tiles at 1× and 3×. Neither artwork is production-approved until a person checks repeated patterns, curvature/stretching, edge transitions, historic appearance and scale.

## Canal T-junction bank clipping — V3 rev 25

At three-way canal junctions, independently painted bank ribbons used to continue across the **opening of another water arm**, producing thin stone-coloured lines through the channel. This was a rendering error, not a problem with Canal Bank Edge 01.

The compositor now clips **all** canal-bank artwork and temporary bank/contact bands to the intersection of the land side of **each** canal core. Repeated even-odd Canvas clips subtract the **union** of the water arms, including shared junction mouths; a single XOR-like even-odd path for all arms would be incorrect. The full water core is drawn *after* the clipped banks, with bridge decks drawn afterwards as before. Exact 88-unit canal and 44-unit street mouths, artwork binaries, material phase and V2 gameplay remain unchanged.

The 20-signature geometry test checks separate water-arm clips and paint order. A real-browser pixel test independently rasterizes the exact water-core union, verifies every fully covered water pixel stays identical with the edging on/off at **T-junctions, straight canals and bends**, and confirms land-side banks remain visible. Additional screenshots cover the T-junction at 1×/3×, the bridge and mobile. Passing CI establishes technical correctness; visual artwork approval is still separate.

## Layer 2 — tile-owned, compass-upright large details (V3 candidate proof)

**Tile compatibility:** the V3 base system already compiles each 220 × 220 square independently from the 20 legal N/E/S/W signatures; connected surfaces share world-space texture coordinates. `assets/v3/layer2-placements.js` adds independently stored decorations at tile-*local* world-unit anchors. An example record is `{x:1,y:0,edges:['L','S','L','S'],seed:7,layer2:[{id:'courtyard-hall-01',x:110,y:35}]}` (the actual validity of any explicit position is checked against that tile's geometry). Moving a tile changes only `x,y`, while the source painting stays upright and its local anchors remain unchanged. No image is physically rotated to match a rotated road.

**Placement safety:** a building footprint must be at least 10 world units inside the tile. A dense 7×7 footprint sample tests distance to every road and canal centreline, including curved quadratics, reserving the 22-unit street half-width plus painted verge and a further 6-unit safety gap, or the 44-unit canal half-width plus bank and a 6-unit gap. Invalid explicit placements are rejected rather than painted over roads or water. The first proof does not let roofs cross tile boundaries; larger future components will require a separate multi-tile/depth-aware occlusion contract.

**First candidate art:** `assets/v3/large/sources/courtyard-hall-01-original.png` (1774 × 887 transparent PNG) and `assets/v3/large/courtyard-hall-01.webp` (1445 × 707 transparent lossless WebP) are preserved and verified against their exact original SHA-256 hashes in the [Layer 2 manifest](../assets/v3/large/manifest.json). The rendered hall occupies 96 × 47 world units. The hall is an **artwork candidate only**: its front-facing facade/roof perspective, scale, brushwork, light direction, historical suitability and repetition must be reviewed against the strict overhead game camera before any production approval. Do not call the component production-ready.

**Reviewable proof:** [Layer 2 Tile Composition Lab](../layer2-lab-v3.html) renders six distinct 220 × 220 tiles, with the exact same geometry, grass, paving, water and painted path/canal borders as Layer 1, before adding the hall independently inside one or more tile boundaries. Select a tile, change only its seed, toggle buildings and tile outlines, switch topology studies, view the serialized board JSON and inspect at 1×/3×. The `tests/v3-layer2.cjs` suite checks all topology signatures, safe anchors, deterministic tile-local data, serialization, no canvas image rotation, original file hashes, lossless WebP and alpha. The browser suite verifies true artwork on desktop/mobile and that stone/water pixels are unchanged when Layer 2 is enabled.

**Next art sequence:** approve or revise this one hall first (including orthographic roof treatment). Then commission an independently painted **willow tree** and **garden rockery** as separate transparent reusable sprites, register their footprints and safe placement rules, and evaluate architectural variants before any playable V3 migration. Keep any landmark bridge or pagoda as its own asset rather than a rotatable component.

## V3 quality gates

**Automated (mandatory for geometry/runtime):**

- All 20 distinct orientations/signatures compile from the unchanged topology definitions.
- Correct number, positions and exact widths of every S/W mouth; L is fully land.
- Route paths end at only their allowed ports, with correct edge-perpendicular tangents.
- Independent road and canal graphs never disconnect; bridge channels remain logically separate.
- Adjacent compatible edges produce identical openings; seed-dependent material sampling remains continuous across seams.
- Same tile+seed yields identical static layers; different seeds may vary interior decoration without moving mouths.
- Valid image dimensions, transparency where required, provenance/sha hashes, and reduced-motion behaviour once those asset classes exist.
- Existing V2 tests stay green.

**Human review (mandatory before claiming artwork accepted):**

- A 3 × 2 pilot neighbourhood of three joined stone-street tiles above three joined canal tiles, tested at 1× and 3× on desktop and mobile.
- Material colour and style consistency, ink-line weight, roof orientation, lighting/shadows, seam appearance, historical plausibility and organic variation.
- Compare against the Slender West Lake paintings as historical/art-direction references, *not* as a source of automatically sliced or stamped textures.
- A green code test confirms technical contracts only; it never certifies art quality or historical accuracy.

## Pilot delivery sequence

1. **Foundation (merged PR #19):** V3 proposal, colour/material manifest, precise geometry-only route generation, independent topology checks and a simple pilot view. The production game remains unchanged.
2. **Material proof (merged PR #20):** three original candidate textures have been committed and mechanically validated. Inspect adjoining tiles, edge sampling, repeat frequency and 1×/3× appearance before production approval.
3. **Edge geometry proof (PR #21):** test strict width-preserving path verges, canal banks and bridge deck boundaries with temporary colours, across straights, bends and junctions. Do not approve these colours as painted artwork.
4. **Painterly edge asset intake (next):** approve one canal-bank strip, then one path-verge strip, and prove their repeat/curve mapping before more scene decoration. Adjust palette *once*, in the shared library.
5. **Large-details proof:** add one wall/house component, one willow and a few rocks as transparent assets, with deterministic placement/exclusion rules.
6. **Fine-details proof:** add a small leaf/moss/flower palette and correct local occlusion/shadow treatment.
7. **Animation proof:** add one low-key animated effect with reduced-motion support.
8. **Migration decision:** side-by-side compare pilot with V2 at overview/1×/3× and only then design how V3 is introduced to the playable board.

**Stop rule:** If the simplest three-material joined neighbourhood is not visually consistent, improve geometry/material generation before adding more assets or replacing the live renderer.
