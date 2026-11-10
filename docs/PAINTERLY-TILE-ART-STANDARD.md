# Yangzhou painterly tile-art standard
**Status:** Mandatory production acceptance contract • 10 November 2026

## The visual reference is binding
The accepted visual benchmark is the *detailed six-square Slender West Lake watercolour painting* in the project's artwork package, NOT the flat green/blue orthographic vector prototype. The overhead camera and the painterly finish are **independent requirements**. Passing topology, loading, geometry or automated CI does not prove art quality.

## Art direction / visual acceptance
Every newly placed square MUST:
1. Read as **rich Jiangnan ink-and-watercolour artwork** at city and close zoom: individually drawn willow fronds, layered foliage, flowering branches, rockery, fine stone paving, tiled/curved roofs, detailed masonry, reflective water, real brush/grain texture. Avoid circles-as-trees, uniform flat fills, symbols and geometric line art.
2. Use a consistent **true overhead / high oblique map viewpoint**, identical roof pitch, scale, ink outlines, shadows and colour temperature across fixed and expandable tiles; no horizon, front elevation or strongly isometric buildings. Roofs remain upright in every allowed rotation.
3. Have **distinct composition**: architecture varies by tile; no adjacent identical pavilion, moon gate, flowering tree or entire crop. One drawing may not simply be stretched, blurred, mirrored or rotated into an apparently new painting. Source reuse must be disclosed and given a visible-review warning.
4. Illustrate the actual activity and place: identifiable market/teahouse/garden/courtyard/landing/bridge or canal. Empty nature is allowed where intentional; landmarks must feel sparse enough to be memorable.
5. Never embed moving people, boats, wakes, smoke or animated shadows in the static tile art. Keep these on separately composited layers.
6. Meet neighbouring tiles **naturally without seam concealment**: no feathered green collars, soft blurred strips, hard black grid baked into images, repeated texture tiles, stretched/broken rooflines, or abrupt changes in the water/land finish. The game UI may optionally draw selection guides, but those must not be part of master art.
7. Preserve visual legibility for students/players: distinct paths and banks, not hidden behind trees; no tree/pavilion placed over a street/canal mouth; colour alone must not be needed to identify a route.

## Gameplay topology / scoring is equally binding
- Square art space: 220 world units; export square WebP at least 512 px (prefer 1024).
- External edges are **[N,E,S,W]** with **L=land**, **S=stone walking street, 44 units wide**, and **W=navigable water, 88 units wide**. Ports meet at edge midpoints. All four 90° rotations must have artwork drawn *in the upright camera* for their rotated signatures: rotate route topology, not roofs.
- Any non-L port must lead to a real **connected internal road or water route**. Streets cannot dead-end in a lawn; explicit destinations/termini must be drawn. Canal ends must have a basin or navigable mooring.
- Water and pedestrian routes are separate layers at bridges. A route is only connected when the **scoring graph** declares that connection. Decorative ponds do not create W ports; casual garden paths do not create S ports.
- Include a visual anchor for scoring activities where applicable: food/teahouse, court gate, scenic viewpoint, enclosed garden, bridge, pier or walking destination. Gardens and courtyard walls have readable boundaries.
- The 3×2 fixed lake may contain broad scenic water across its **own internal seams**; its two **external** W exits still must be centered and 88 units wide, and the bridge's west/east walkway must terminate at real destination gates. Do not generalise this exception to player-placed tiles.

## Asset conventions
- All six starting tiles are independent 512+ px painted squares under `assets/lake/`. A single coordinated composition can be the *art-direction design* but export individual square assets without a grid baked in.
- Every playable archetype/rotation needs a directly authored square, with provenance, topology, rotation and preview in a machine-readable manifest. A sprite atlas can transport independent masters but cannot replace per-variant artwork authoring.
- Keep 2×/close-zoom detail readable; don't upscale a tiny flat illustration and claim it is a production painting.
- No route mask or edge-band pass is permitted to cover finished painted roofs, bridges, or landmarks. Use an artwork-controlled connection template from the start.

## Mandatory QA matrix before default activation
**Technical** (must pass): every archetype × 4 rotations; canonical external L/S/W port widths and positions; N/E/S/W neighbour agreement; no double paint; six starters plus all ten perimeter placements; every original and dynamic asset loads on desktop/mobile; zoom and pan; no JS errors; stable tile IDs; and all explicit destination anchors valid.

**Visual** (requires human review of real game, not isolated file): an overview and 2× close-up of each archetype, the full 3×2 Slender West Lake, and a representative 16-tile ring. Compare one-for-one against the accepted painting. Check continuity of branches, rockeries, buildings, waterways, garden fences, sidewalks, and shadows. Flag repetition, broad blur, flat fill and missing architectural detail.

**Historical/style** (requires human review): Jiangnan / Yangzhou material culture, roofs, pagodas, bridge silhouette, willow garden planting. Avoid generic fantasy Chinese architecture.

**Release policy:** status `prototype` or `review` until BOTH technical and visual gates pass. A successful merge or CI run is not equivalent to painterly approval. Never silently enable a low-fidelity fallback on the public default; if art is unavailable use a clearly identified preview/placeholder and report why.

## Grading rubric for each tile
Score each category **0–3** (0 absent/unusable, 1 significant mismatch, 2 reasonable but needs work, 3 matches target):
- Painterly detail / texture
- Overhead perspective and upright buildings
- Distinctness of composition
- Road, canal, landmark and scoring accuracy
- Seam continuity and visual consistency with neighbours
- Close-zoom quality and absence of baked-in motion

**Pass:** at least 16/18, *and no individual category below 2*, with annotated desktop/mobile screenshots. Self-generated code tests alone cannot assign these scores. Screenshot evidence and reviewer initials/date must be recorded in the art manifest before marking `approved`.

## Work order
1. Compose the specific route graph, scoring anchors and edge template.
2. Paint/retouch the full tile in the accepted style, from the edge ports inwards, keeping roofs upright.
3. Export a high-resolution square; validate port pixels and route anchors.
4. Inspect the piece alone and in several **real neighbouring combinations**.
5. Retouch failing joints and repeat. Only then enable in the main game.

See `docs/SCORING-RULES-V1.md`, `docs/SLENDER-WEST-LAKE-TEMPLATES.md`, and `docs/TILE-EDGE-CONTRACT.md` for gameplay geometry.
