# Yangzhou V3 — Unified Layer 2 candidate placement (rev 49)

**Status:** GitHub PR review candidate; **not** deployed into the playable V2 game. The five original PNG paintings and their original lossless WebPs remain byte-identical to their accepted intake. Artwork is still `productionApproved:false`.

## Scope

This pass registers five new painted candidates in the canonical `layer2-placements.js` registry and integrates them with **the real Layer 1A geography, exact Layer 1B enclosed-courtyard paving / approach, continuous painted Layer 2 wall profiles and genuine 30-unit moon-gates**.

| Candidate | World footprint | Permitted placement |
|---|---:|---|
| Garden Pavilion 01 | 52×52 | Land-only garden, compass-upright |
| Bamboo Grove 01 | 62×45 | Land-only garden, full rock-and-stem footprint clear |
| Garden Rockery 02 | 60×41 | Land-only garden, solid footprint |
| Courtyard Wing 01 | 33×87 | Side of hall in **new wider courtyard** only; no forced overlap in original rectangle |
| Waterside Landing 01 | 95×47 | North bank on east-west **straight** canal `L/W/L/W`, exactly at (110,53); water edge still awaiting manual art review |

The module `assets/v3/layer2-integrated.js` derives compositional placements from **tile-local** positions, not board grid x/y. Solid objects are tested against the full road/canal shape, the original building occupancy, continuous wall foundation ribbons, moon-gate opening masks and the existing 12-unit courtyard path. No image is rotated, mirrored, drawn when missing, or stretched outside its source-inspired world footprint. The core legacy seeded system is preserved as-is for the original V3 Layer 2 laboratory and V2 isolation.

## New honest courtyard variant

The original enclosed rectangle has wall centrelines x=42..178 and a 96-unit-wide hall. A 33-unit-wide side wing cannot sit there with suitable spacing.

The new review-only **wider walled residence** uses an alternative, correctly compiled rectangular wall centreline around (22,43)..(198,194), a genuine 30-unit opening at (124,194), hall centre (124,97) and wing centre (52,107). The hall (96×47) and wing (33×87) have >7 world units of horizontal separation, avoid the stone foundations, and do not cross the gate-to-hall path. Its model ID remains `rectangle` only so the already-established Layer 1B paving and walkway renderers can reuse their correct geometry-derived regions; it carries a distinct `role: wide-courtyard` and name to prevent confusing this with the original geometry.

The **original rectangle, partial, L and T** models remain unchanged. This is an optional new composition in `MODEL_KINDS.wide`, not a quiet alteration to prior accepted wall plans.

## Waterside Landing 01 contract

The landing is a special shoreline candidate, not a free-placeable solid inland sprite. It is permitted only when the tile ports are exactly `['L','W','L','W']`, the 88-unit water corridor is one straight horizontal canal, and the landscape is unwalled. The south-facing steps at (110,53), within the original artwork, reach approximately 10.5 units into the north bank of that water corridor. No water width, canal mouth, bank geometry, or boat route is modified, and no landing is placed on a canal junction, curved canal, street crossing or land-only tile. The original alpha-masked art still needs **human review of embedded painted water, hard mask edges and perceived scale** before it could be gameplay-ready.

## Preview, tests and acceptance

Use `layer2-integrated-v3.html` for the six-tile **connected** V3 review scene. Tiles 1–3 are land gardens/courtyards; tiles 4–6 share a valid horizontal canal. The scene loads and hashes the five original WebPs against `assets/v3/large/new-candidates-manifest.json` and uses the original hall, moon gate, painterly wall materials, courtyard paving and walkway. The visible toggles can turn off all newly integrated art or the shoreline candidate separately, and 1×/3× zoom reveals roof/weathering details.

`tests/v3-layer2-integrated.cjs` checks each original asset SHA-256, bounding-box separation, all geometric tile signatures, world/local anchor invariance, the real passable gate, exactly protected 44-unit street and 88-unit canal ports, and special shoreline rejection. `tests/v3-layer2-integrated-visual.cjs` checks browser image integrity and actual scene pixels at 1×/3× and mobile with toggles and an invalid-shore case. Both are wired into GitHub Actions and do not replace existing QA for V2 or earlier wall laboratories.

**Review criteria before merging:** Does the hall+wing appear coherent at default zoom? Does bamboo frame, rather than obscure, pavilion/rockery art? Do all four original walls and their south/side textures remain continuous? Does the path reach the actual moon-gate centre? At the canal landing, are the bottom alpha pixels and painted water illusion believable against the true V3 water material? Confirm that land and water still connect across adjacent tile boundaries.

**Follow-on after approval:** deliberate scene grammar, alternate courtyard dimensions and shore-landings for additional bank orientations, rather than rotating the artwork or bypassing connector rules.
