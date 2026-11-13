# Yangzhou V3 — Continuous Wall Geometry and Texture System

**Status:** isolated, unapproved Layer 2 geometry experiment. The playable V2 game and existing V3 labs remain untouched.

[Open the six-tile Wall Geometry & Texture Lab](../wall-geometry-lab-v3.html?rev=41) (once deployed).

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

The original PNG has been preserved outside the repository; its exact prepared 1256×314, 174,360-byte WebP is **now committed and hash-verified** under `assets/v3/wall-materials/wall-roof-tiles-01.webp`. The new test loads it automatically and offers a local file selector only as a fallback. The material manifest and preparation steps live in `assets/v3/wall-materials/`.

## Single camera-consistent south-facing wall projection — rev 41

The user found that the previous rev40 "four-corner infill" created large white masonry blocks projecting to the right of north–south walls. That architecture mixed two camera directions: south-facing plaster for horizontal walls and east-facing plaster for vertical walls. Rev41 **supersedes the rev38–40 side façade/corner-infill treatment in the isolated V3 Wall Geometry Lab**. The historical sections below describe the experiments they replace, not the current production candidate.

**New rendering contract:**

- Camera looks slightly downward from the south. **Both east–west walls** expose ivory plaster and a single-course stone base **south of the roof coping**. North/top wall depth remains 6 units, south/bottom depth remains 10 units, matching the previous hall-relative scale.
- **North–south walls:** retain exactly the original mitered grey roof-tile painting, compass rotated **−90°**, plus just a **1.05-world-unit shaded eastern eave** and a faint 0.55-unit shadow. They have **zero visible ivory plaster or stone foundation**. This is a narrow roof edge, not a second perpendicular architectural façade.
- All L corners continue to use **the same single shared centreline vertex and roof-miter polygons**. Horizontal wall-face endpoints are trimmed by 3.75 units (just under the roof's 4-unit half-width) whenever they meet a perpendicular centreline. The roof conceals the trim at the actual turn. **No synthetic plaster pier, upper-right white rectangle, stone-return slab or extra corner sprite is drawn.**
- Existing authentic roof, plaster and stone WebP files, pixel dimensions, SHA-256 checksums, and natural texture scale are preserved. Painted plaster and stone are only mapped to the horizontal façade quads, not stretched onto hidden sides.
- The horizontal frontage retains real moon-gate apertures: all material masks are cut by the existing compiled geometry. Thin jamb return strokes terminate on the exact gap boundaries and cannot bridge the opening.
- The profile's new narrow vertical eave, contact shadow and precisely trimmed horizontal polygons feed the existing **tile inset, hall clearance, 44-unit street and 88-unit canal exclusion** checks. Neither Layer 1 nor V2 gameplay are touched.

The four NW/NE/SW/SE close-up previews are still **live crops from the real painted six-tile scene**, not separately painted corner assets. Check the absence of grass-filled seams directly beneath the roof, and ensure that there is **no oversized white or stone block visible to the right of either vertical roof**. Desktop and mobile Playwright screenshot tests record both **1× and 3×**, the genuine moon-gate cutout, material toggles, all corner orientations and the protected Layer 1 routes.

**Status:** geometry-and-occlusion candidate; visually review at 1×/3×. No new image has been generated. All three paintings remain candidate artworks and the playable V2 game is unchanged.

## Continuous projected corner masonry — rev 40

**User-observed defect:** the top-down roof was correctly mitered, but the ivory plaster and grey stone foundation stopped at each straight segment. Only the southeast turn received a partial infill, producing bare slivers and abrupt texture/stone endings where side and front façades met.

**Revised rule:** one 90-degree wall joint has a single **projected masonry pier**. The join is derived mathematically from the actual intersection of the two orthogonal centreline segments, their camera-facing façade depths and the visible 1.7-unit foundation bands. This is applied to **NW, NE, SW and SE**, with no new painted sprite or altered roof artwork.

- All four joints receive a camera-facing +X/+Y plaster envelope under the mitered coping. The formerly exposed positive-quadrant between the two offset straight faces is now closed, including the 0–3.25 unit under-eave return previously unpainted at southeast.
- The horizontal plaster material retains its original world-axis texture phase through the visible joint; a short under-eave strip is only used behind the coping so no grass appears at corners where straight faces meet. Stone Base 01 continues around **both** the south/bottom edge and the east/right edge. Both original material paintings are rendered **opaque** at shared joins, avoiding dark double-alpha stripes.
- Contact shadows follow the two projected outer edges. The roof itself remains the same miter-clipped Wall Roof-Tile 01 painting and still turns by exactly 90 degrees.
- Real moon gates keep their physical cut-out. The two terminating plaster/stone faces get thin **return-edge** details along their wall boundary, rather than another wall image or an artificial solid gate.
- The enlarged projected corner and its shadows are included in **Layer 1 route/inset and hall-clearance checks**. There is no change to tile port widths (street 44, canal 88), exact base material masks, or the playable game.
- The lab now has **four real live cropped inspection canvases**, one for each corner, derived directly from the painted six-tile scene rather than mock images. They update when an artwork file loads, a material is toggled, or the courtyard geometry changes.

The four corner joints are a **rendering pass and candidate**, not historical visual approval. Pixel-level desktop, 3× and mobile regressions check no exposed grass at the southeast turn, wrapped stone on two faces, transparent/passable gate centres, and unchanged roof when other materials are toggled. The accepted master artwork files and their SHA-256 provenance remain untouched. Review the directional painted seam at the corners at both zoom levels before commissioning any specialist corner-coping artwork.

## Painted ivory plaster and stone foundation — rev 39

The two newly generated watercolour paintings are now committed as **original-art derivatives** in the same isolated Layer 2 materials library as Roof-Tile Texture 01:

| Painted material | GitHub WebP | Source illustration | Renderer |
|---|---|---|---|
| Ivory plaster | `assets/v3/wall-materials/wall-plaster-ivory-01.webp` (1256×314; 56,950 bytes) | Original 2508×627 watercolour plaster image | Clips to the camera-facing ivory plaster quadrilaterals; repeats at the image's natural 4:1 ratio |
| Weathered stone | `assets/v3/wall-materials/wall-stone-base-01.webp` (1256×157; 69,958 bytes) | Upper course of the original 2508×627 two-course stone illustration; original preserved | Clips to the 1.7-unit visible foundation strip; natural 8:1 strip ratio |

The two original PNGs are preserved in the conversation assets. WebPs were resized with LANCZOS, encoded WebP quality 91, and the outer 8% of pixels were adjusted with a symmetric smooth cosine to reduce visible repeat seams. Original source and prepared derivative SHA-256 values, dimensions, exact git blob SHAs, and crop boundaries are recorded in `assets/v3/wall-materials/manifest.json`. The prepared WebP bytes on GitHub must match those hashes. **No new content has been generated or substituted during integration.**

`assets/v3/wall-face-materials.js` maps both candidates using the wall's local centreline and perpendicular direction. Horizontal sections are painted west→east; vertical sections reuse the same surface rotated −90°. Material period is computed directly from the band height and original image aspect ratio: plaster's repeat length is four times the visible plaster-face height; the stone base repeats every 13.6 world units. Each visible face is individually clipped, so the moon-gate corridor stays truly open and hidden-side plaster does not reappear. The existing roof-tile texture remains exactly the same.

The Wall Geometry Lab exposes independent **Painted ivory plaster** and **Painted stone foundation** toggles, progressive SHA-256-verified loading, and local WebP comparison controls. If an image is unavailable, only its diagnostic fill appears. Review all three candidates together at 1× and 3×, with special attention to foundation scale, joined walls and moon-gate ends. These are **candidates**, not production approval or a migration to the playable V2 game.

## Perspective-aware wall profile — rev 38

The previous symmetric 16/12/8-unit material strokes made ivory plaster appear **above** roof tiles and on both sides of each wall. That is appropriate as a structural placeholder but not consistent with the slightly oblique, overhead Courtyard Hall 01. The revised wall material is drawn as a *one-sided elevation* underneath the original coping, not as a new wall sprite.

- **Horizontal north/top wall:** ivory plaster face projects **6 world units downscreen (south)** from the outer roof edge. This is deliberately shallow because the far wall sits farther back in the picture.
- **Horizontal south/bottom wall:** the face projects **10 world units south** of the roof, making its façade and stone base more visible, as with the existing hall painting.
- **West/east side walls:** faces project **7 / 8 world units to screen-right (east)** respectively. The roof uses the **same accepted 32×8 roof tile texture rotated −90°**, not a new or stretched painting.
- **Hidden side:** no foundation or plaster extends north of horizontal coping or west of vertical coping. All wall faces begin **3.25 units from the centreline** (within the coping's 4-unit half-width), so the overhanging roof hides their top edges.
- **Foundation:** a **1.7-world-unit** stone band is painted at the *far* visible edge of each plaster face, with a soft 0.75-unit ground shadow. It is not a symmetric stone halo.
- **Corners and T junctions:** one physically shared roof remains centred on the vector wall paths; the face polygons follow the viewer-facing side and a single southeast outer corner receives a proper connected infill. A gate remains an actual omission through **roof, plaster and foundation**.
- **Safety:** the rendered one-sided plaster, foundation and faint shadow footprints are sampled against tile insets, courtyard hall clearance and the **existing exact street/canal route masks**. This is an *additional visual-envelope audit*, not a change to canonical Layer 1 geometry.
- **Comparison:** the V3 wall lab defaults to this new profile and provides a **Show perspective-aware wall faces** toggle to compare it with the prior symmetric diagnostic rendering. Painted roof tiles are independently toggleable.

The roof painter now orients texture by **compass/view side**, rather than by the arbitrary traversal direction of each polyline: east–west sections use angle 0°, north–south sections use angle −90°. This prevents the same tile artwork from appearing upside down or changing its shading when the centreline turns or reverses.

The plaster and base are still *diagnostic colour gradients*, pending separate painted textures. The roof artwork remains the accepted **candidate** rather than a final production-approved material. Perspective depth and proportion require 1× and 3× human review against the hall.

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
