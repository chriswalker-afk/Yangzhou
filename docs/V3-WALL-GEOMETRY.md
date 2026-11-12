# Yangzhou V3 — Continuous Wall Geometry and Texture System

**Status:** isolated, unapproved Layer 2 geometry experiment. The playable V2 game and existing V3 labs remain untouched.

[Open the six-tile Wall Geometry & Texture Lab](../wall-geometry-lab-v3.html?rev=37) (once deployed).

## Why switch

Full wall sprites consistently produced exposed grass at joins, doubled roof caps, inconsistent wall heights and unrealistic sprite rotations. This proof uses **continuous wall centrelines**. The roof, plaster and foundation follow shared mathematical geometry, just as V3 grass, stone paving and canal water already follow separate material masks.

No old wall-sprite WebPs are deleted. They remain a visual comparison in the previous courtyard assembly lab; they are **not used to render these new walls**.

## One geometry model

A tile is 220 x 220 local world units. A compound is a named set of centreline polylines plus defined, genuine gaps for gates. The base geography's N/E/S/W edge signatures remain exactly the same.

- Draw an outer stone foundation stroke, then plaster, grey tile coping and ridge strokes, **per material across every path**, so intersections share a continuous substrate.
- Use miter joins with a common wall thickness at turns. A right-angle **L** is one polyline vertex, not a corner sprite. A **T** is a perpendicular path ending *exactly* on a continuous crossing centreline.
- A rectangular perimeter is kept as **one continuous polyline**, including all four corners. The gate is the **only break** in the painted/solid path. A closed loop does not restart at a separate wall sprite.
- For each moon gate, locate its centre exactly on a straight wall segment, derive the start/end from the gate width, and remove **the interval from all four solid material bands**. The top-down entry is genuinely passable. Thin dotted marks are optional *diagnostic ground guides* and have no collision. Decorative circular moon-gate surrounds are a **future painting task**; this proof does not disguise a line as a finished architectural arch.
- Define wall geometry inside the tile with an inset of at least 10 units and route clearance beyond the fixed 44-unit road and 88-unit water ports. The wall material foundation is counted at full half-width, so walls do not sit in water, paved streets, their edge treatment or within the safe gap.
- Validate the **underlying original uncut centreline** against routes as well as the solid fragments. A moon-gate opening may not be used to disguise an illegal street/canal intersection.
- Put a real painted Courtyard Hall 01 inside eligible compounds. Its existing 96 x 47 footprint and 6-unit clearance are checked against the walls. On tiles with incompatible road/canal paths, reject the wall compound **as a whole** and retain the same Layer 1 geography.

## Flat diagnostic material bands

| Surface slot | Stroke thickness in 220-unit world space | Diagnostic colour | Production artwork |
|---|---:|---|---|
| stone foundation | 16 | #aaa59b | **Not yet created** |
| ivory white plaster | 12 | #e9e4d4 | **Not yet created** |
| grey clay-tile coping | 8 | #636d69 (fallback) | **Wall Roof-Tile Texture 01 candidate** |
| thin roof ridge / joint accent | 2 | #a8afa5 | **Not yet created** |

**Revision 37:** the 8-unit coping strip accepts the first actual painted material candidate, Wall Roof-Tile Texture 01, alongside its old flat-colour fallback. The bitmap is **not production-approved**, and the preview loader refuses incorrect hashes. Material U is 32 world units per repeat and V is the 8-unit coping width. The shared coping substrate is still rendered before the miter-clipped image, so gaps cannot expose grass; moon-gate openings remain real. The ridge stroke is hidden when the painted roof surface is active, because the artwork already contains highlights. Existing V3 grass/paving/water can still appear behind the walls, and the hall remains an unchanged Layer 2 sprite.

The original PNG has been preserved outside the repository; its prepared 1256×314, 174,360-byte WebP **requires exact binary upload** under `assets/v3/wall-materials/wall-roof-tiles-01.webp`. The new test works in flat diagnostic mode until it arrives, and has a local file selector for truthful visual preview. The material manifest and preparation steps live in `assets/v3/wall-materials/`.

## Geometry cases

| Case | Description | Expected joins and gate |
|---|---|---|
| Rectangular | one closed perimeter around the hall | 4 mitered L corners, 30-unit cut-out moon gate on south wall |
| Partial | three-sided garden around the hall | 2 L turns, 30-unit cut-out gate along north wall |
| Elbow | an independent wall turning around the hall | 1 L corner, no gate |
| T-junction | one horizontal wall with a perpendicular branch | 1 genuine T join, 24-unit cut-out gate on horizontal wall |

Gate widths exceed the full 16-unit foundation band. The exact centre of the gate and the perpendicular corridor are outside the wall's collision mask; no paint can close these apertures.

## Future painted texture contract

**Completed first image candidate: wall-roof-tiles-01**, a reusable muted charcoal-grey **roof-coping surface** compatible with Jiangnan/Yangzhou late-Qianlong material and the existing Courtyard Hall 01. It is not yet production-approved. Unlike a standalone wall painting:

- Render a horizontally repeatable, unbroken band of small grey traditional clay tiles; **seamless on its left and right edges**.
- Keep a consistent top-down/orthographic surface and restrained ink-and-watercolour lighting. No white wall, foundations, corner caps, ground, vegetation, gates, shadows on grass, labels or borders.
- The repeated material has no fake end caps; terminal and moon-gate finishing will be separate overlays if needed.
- The artwork should be sharp enough at 1x and readable at 3x, with low-frequency variation to avoid identical repeats.
- Source RGBA PNG and lossless WebP should be preserved and checksum-tracked after visual approval.
- **Mapping is now implemented** with local arclength **u** and cross-wall offset **v**, using 32×8 world-unit repeats clipped by mathematical miter polygons. T intersections share continuous backing geometry; their paint motifs and phase still need close 1×/3× human review before final approval.
- After approving roof-tile scale and joins, commission **one white-plaster material**, followed by stone foundation and a separate moon-gate surround constrained to the real passable gap. Do not generate these other assets until the coping material is reviewed.

This is a **geometry acceptance stage**. It proves exact intersections and openings, not a finished roof-tile UV renderer or painterly quality.

## Automated acceptance

- Unit tests verify 4 L corners on the rectangle, a single T on the branch, zero junction gaps, gate centres and structural opening widths, collision-free transverse passage, reproducibility under moving the entire tile, and rejection beside exact street/canal routes.
- Browser tests verify that six independent tiles display the models at 1x and 3x, flat diagnostic geometry appears without waiting for network image downloads, the existing hall can load as optional genuine artwork, gate centre alpha is a real background hole, and V2/source Layer 1 are not modified.
- Tests use the **existing** YangzhouV3Geometry, YangzhouV3Edges and V3 Layer 2 hall footprint. No gameplay transition has been attempted.

## Review after lab

Compare the all-land courtyards, connected street/canal layouts and a three-way canal junction. Confirm proportions of the rectangular compound relative to the hall, and adjust diagnostic band widths before commissioning textures. Then paint one roof-tile texture, register its provenance, and build a directional u/v-mapping visual lab without replacing this geometry reference.
