# Yangzhou V3 — Canonical Layer 2 Asset Generation Prompt

**Status:** proposed repeatable production brief, based on the artwork-certified V3 asset library. Use with the **actual source paintings attached** to the image-generation request. A text prompt without the reference paintings is insufficient for assured camera/style consistency.

## 0. Mandatory references for every generation

Attach these committed original art references (use the relevant ones, never substitute a newly generated 4x4 moodboard as the camera master):

1. **Primary camera / scale / grey roof reference:** `assets/v3/large/sources/courtyard-hall-01-original.png` (or its unchanged lossless WebP `assets/v3/large/courtyard-hall-01.webp`).
2. **Different roof orientation reference, when needed:** `assets/v3/large/sources/courtyard-wing-01-original.png` (north–south roof ridge; not a rotated copy of Hall 01).
3. **Small open building reference, when needed:** `assets/v3/large/sources/garden-pavilion-01-original.png`.
4. **Stone / ivory plaster / tiled coping:** actual V3 wall-material artwork and `assets/v3/enclosures/moon-gate-01.webp`.
5. **Ground/water palette only:** the existing grass, paving and jade-water texture paintings. These are *not* permission to paint ground/water into a Layer 2 sprite.

Primary rule: **match the supplied paintings, not the broad words "Chinese watercolor"**. The project palette `assets/v3/style-spec.json` is a provisional colour guide; the certified image references take precedence over approximate hex codes.

## 1. Asset brief to fill in

- **Exact name / ID:** [ASSET_NAME] / [asset-id]
- **One-sentence purpose:** [WHAT THE OBJECT DOES]
- **Asset family:** [building | garden feature | vegetation | portal | wall embellishment | canal-front object | bridge decoration]
- **Geometry-owned placement:** [WHERE IT MAY SIT, e.g. enclosed courtyard, north bank of straight canal, beside street]
- **Authored compass orientation:** [E-W roof ridge / N-S roof ridge / south-facing facade / other SPECIFIED view]
- **World footprint:** [WIDTH × HEIGHT] units inside a 220 × 220 world-unit tile
- **Necessary structural details:** [MATERIALS, FEATURES, OPENINGS, SUPPORTS, EAVES, STEPS]
- **Must remain clear/transparent:** [PATH, GATE OPENING, STONE/WATER REGION, SIDE OF OBJECT]
- **References attached:** [LIST OF REAL CERTIFIED ORIGINALS]
- **Distinctive but subtle differences from existing sprites:** [2–3 details]

## 2. Copy/paste master image-generation prompt

~~~text
Create exactly ONE high-quality, independent, reusable 2D game-art sprite
for "Yangzhou V3", a tile-placement game set in 18th-century Jiangnan China.

ASSET
Name: [ASSET_NAME]
Purpose: [ONE-SENTENCE PURPOSE]
Subject/parts that belong to this sprite: [EXACT COMPONENTS]
Placement context (geometry information, NOT scenery to paint): [CONTEXT]
Authored compass orientation: [ORIENTATION]
Approximate on-board footprint: [WIDTH] × [HEIGHT] world units on a
220 × 220 world-unit tile.
Required visible structure: [DETAILS]
Clearances and genuinely open spaces: [RESTRICTIONS]

ABSOLUTE REFERENCE PRIORITY
Treat the attached original "Courtyard Hall 01" as the primary visual
standard for camera angle, architectural proportions, grey tiled-roof
painting, eave thickness, timber and stone detail, ink-line character,
colour saturation and scale of architectural texture.
Use the other supplied, actual Yangzhou V3 approved paintings as secondary
orientation/material references. Maintain their consistent visual language.
Do not reinterpret the reference as a cinematic, isometric, eye-level,
fantasy, or modern architectural illustration.

CAMERA — FIXED FOR THE ENTIRE GAME
High, nearly overhead, shallow south-facing orthographic game camera.
The viewer is above the object, with the roof/top surfaces strongly visible.
If the object has a southern face, show only the short, plausible strip of
its south-facing facade beneath the roof/eaves, in proportion to Hall 01.
No dramatic diagonal vanishing lines, no large projecting side facade,
no deep three-quarter/isometric view and no independent camera rotation.
North is up on the image, south is down; roof-ridge orientation follows the
AUTHORED orientation above, not a raster rotation of a different asset.

PAINTING STYLE — MATCH THE ORIGINAL LIBRARY
Hand-painted Chinese ink and restrained watercolour on fine, faintly
textured rice paper: precise but gently irregular charcoal-ink contour
lines, layered translucent washes, hand-rendered roof tile rows, soft
granulating pigments and believable small architectural wear.
Quiet, natural detail density readable at normal board zoom, with extra
texture rewarding 3x inspection. Refined rather than cartoonish,
photorealistic, glossy, digitally airbrushed or vector-flat.

MATERIALS & COLOUR — LOCKED TO REFERENCES
Aged slate/charcoal grey roof tiles, warm ivory plaster, restrained
weathered reddish-brown timber, grey-beige worn stone and muted mossy
greens where relevant. Jade canal water is a Layer 1 background material,
NOT part of this sprite unless the explicitly requested asset is an
independent water-effect component. Match the references' existing pigment
hues, contrast and line weight. Consistent diffused daylight and subtle
local contact shadows, without a new dramatic light direction.

ARCHITECTURAL / HISTORICAL FORM
Plausible Jiangnan/Yangzhou architecture for the specified period:
appropriate grey tiled roofs and raised eaves, timber joinery, stone
thresholds and restrained ornament. Prefer structural credibility over
exaggerated ornament. Do not invent a named historic landmark or imply
precise historical authentication unless a specific verified reference
and date are supplied.

MODULARITY — ESSENTIAL
This is ONE freestanding Layer 2 object, NOT a whole tile, not a map
screenshot and not a completed scene. Draw only the named object's
visible components. No baked grass, earth, courtyard paving, road,
canal, large river/lake, distant architecture, sky, mountains, decorative
framing, title, label, lettering, humans or unrelated ornaments.
Do not place a background under the asset. Do not paint connecting roads
or water to make it look integrated; those are supplied by the game's
precise Layer 1 masks. Do not include neighboring tile boundaries.
Keep the entire object, including extended eaves or roots, inside frame
with a small clear margin so nothing is clipped.

OUTPUT
One isolated artwork sprite on TRUE TRANSPARENT RGBA background, with a
clean, natural antialiased alpha edge. Retain only subtle contact shadow
integral to the object. Preserve transparent real gaps between supports or
through openings. Natural, crisp paint detail with soft watercolor edges.
No presentation board, text, comparison panel, mockup or alternate design.

INSTRUCTION PRIORITY WHEN UNSURE
Camera + original reference fidelity > physical structure > correct
orientation and footprint > painterly surface detail > decorative flourish.
If a visual flourish would violate transparency, the authored orientation,
the camera or the footprint, OMIT it.

Generate this single original sprite now.
~~~

## 3. Add one family-specific paragraph

Append exactly one of the following, tailored to the asset. The master prompt remains fixed.

**Hall / shopfront / smaller residence:** "The broad tiled roof is the dominant visible shape. Under the eaves is a narrow south-facing timber/plaster facade, not a large front elevation. Do not add land, courtyard walls, paving or an approach road."

**North–south wing:** "Paint a genuinely new building with the ridge aligned vertically north–south in the artwork. Derive its perspective from the original Hall 01 camera and Wing 01 example. Do NOT rotate, mirror or stretch an east–west hall painting; show only the physically plausible exposed eave/edge faces."

**Pavilion / covered garden corridor:** "Show real open air and transparency between columns. The roof/column ratio must match the certified small pavilion. Ends that connect to other structures should be clean, spatially plausible and separately placeable."

**Willow / bamboo / flowering tree:** "Canopy/leaves may extend visually, but the root/trunk ground contact has a defined small footprint. No painted grass patch under the plant. Match the painted garden foliage, not photographic leaves or colourful anime foliage."

**Rockery / stone steps:** "Use weathered scholar-stone/grey-beige hand-painted stone with believable layered shadows and subtle botanical accents only where they are integral to the object. Do not invent a complete garden scene."

**Waterside structure / landing:** "The specified shore orientation is fixed. Paint only the architecture, stone bank interfaces and own steps; the game already paints jade water and bank textures. Do not embed a turquoise pond or rectangular water patch. Avoid an opaque colour under transparent step edges."

**Bridge parapet / railing:** "Paint precisely the named low bridge structure on a truly transparent background. The game separately supplies the road deck and the continuously connected canal beneath. Do not generate a whole bridge tile, road surface, new canal geometry, turquoise water, or a stone platform covering the navigation opening. Author each genuinely different bank-facing orientation separately."

**Moon gate or portal:** "A circular aperture must be truly transparent and physically open, surrounded by textured masonry and roof detail consistent with the original approved Moon Gate 01. Do not use a thin vector semicircle, a solid medallion or an opaque fake opening."

## 4. Generation and QA procedure

1. **Attach the originals every time.** Reference images are required, not optional. Supply Hall 01 + the most relevant other certified sprite + active material references.
2. **Fill every variable.** Define asset class, camera orientation, source family, geometry-owned location and desired world footprint before requesting a painting.
3. **Generate exactly one image.** Compare at normal size and 3× against real existing assets; do not accept a full-scene illustration in place of a sprite.
4. **Reject camera drift** immediately: large visible facades, inconsistent eaves, steep isometric views, side-on elevations, vanishing points and raster-rotated architecture require repainting.
5. **Reject style drift:** different slate-grey tiles, bright grass/water, saturated reds, shiny materials, 3D shadows, hard vectors, overlarge ink lines or inconsistent texture grain.
6. **Verify alpha and geometry:** check edges, pier gaps, moon-gate apertures, roots, roof overhang, ownership/footprint and absence of painted Layer 1 geography.
7. **Keep exact source art:** preserve the new original PNG, prepare a separate lossless WebP, calculate SHA-256 and record dimensions/alpha/world footprint in the manifest. Do not replace original paintings silently.
8. **Integrate via actual geometry and test:** use the V3 unified placement rules; 1×/3× and mobile browser review; legal road/canal/wall paths; neighbouring tiles; no path or water blockers.
9. **Review three different arrangements** on a connected board to catch recognisable copy-and-paste repetition before artwork certification.
10. **Two-stage approval:** `artworkCertifiedForV3=true` after visual/integrity review; `productionApproved=false` until historical, whole-board and actual gameplay release tests are completed.

**Do not treat a standalone AI-generated 4×4 tile picture as a reliable asset/camera reference.** A painted collage may be a moodboard, but has not satisfied the game's individual tile ownership, exact 44-unit street ports, 88-unit water ports, mask/junction continuity, or transparent object requirements.

## 5. Filled-in example: Street Shopfront 01

Use the master prompt above, with these substitutions:

- Name: **Street Shopfront 01**.
- Purpose: a compact Yangzhou commercial building facing a paved street, clearly distinct from an enclosed garden hall.
- Parts: complete small grey tiled roof, narrow timber facade with shutters and restrained shop door; modest stone threshold only, no market stalls or neighbouring buildings.
- Placement: land beside a geometry-authored street; cannot overlap the 44-unit paved road core or its edge treatment.
- Orientation: **east–west roof ridge, facade facing south**; never rotate the original.
- Example planned footprint: **72 × 43 world units** (candidate only; confirm in the compositor before painting).
- Structure: grey ceramic tiles, plaster side cheeks, hand-drawn warm timber shutter detail, lightly weathered stone threshold, soft local contact shadow.
- Clearances: visible door not blocked by decorations; no street, curb, paving, grass or canal in source sprite.
- References: original Courtyard Hall 01, current continuous-wall plaster/roof/stone textures, original Garden Pavilion 01 for small details.
- Distinction: commercial shutter rhythm and simpler shop roof; no ornamental garden facade or excess upturned pagoda roof.

The repeated instructions are deliberately stringent: only the asset-specific fields should change. Never rewrite the camera and style sections for each new image.
