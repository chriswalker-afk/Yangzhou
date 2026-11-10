# Slender West Lake — overhead painted artwork upgrade

**Date:** 10 November 2026
**Status:** All six high-detail WebP masters **committed to the GitHub artwork branch and hash-verified**; staged preview available, but **not yet activated by default** while exterior water-port QA and historical review remain outstanding.

## What was produced
- A new, detailed, near-orthographic 1536×1024 ink-and-watercolour lake illustration, composed as a single coherent scene with **no visible tile grid and no boats or people**.
- Six separate 512×512 WEBP tile exports (the exact files named in `assets/lake/manifest.json`) cropped along mathematically exact 3×2 boundaries. No blur, green collars or seam feathering are baked into any tile.
- Recognisable features from overhead: White Pagoda in the southwest, five distinct pavilion roofs on an east–west bridge across the lower central lake, northeast tea pavilion and southeast courtyard/breakfast house.
- A user-facing ZIP of master painting, individual tile files, and a **review-only** grid overlay. The six WebP files were also imported as binary Git blobs, verified by comparing each server SHA against the local Git-blob SHA, and committed to `assets/lake/`.

## How the game integration works
- `painted-lake.js` only loads the six image files if the manifest status is `approved` and its six filename/edge/coordinate entries match the playable topology exactly.
- Every image must decode and be square with at least 512×512 pixels; the six are activated **atomically**. Partial upload never produces a broken collage.
- When the manifest is `staged`, as it is in this PR, the current overhead generator remains in place by default. For **explicit opt-in visual inspection**, append `?lakeArt=preview` to the site URL. Preview mode loads all six images atomically but does not change the manifest or certify production quality.
- `tile-system.js` uses the approved painted assets without transparent apron overlays or old panoramic slicing. It retains the orthographic generator as a safe fallback.
- The page keeps separate boat/pedestrian actor layers; the new base art contains no moving people or vessels.

## The outstanding blocker — strict water-connection geometry
The painting is a stronger, near-orthographic visual composition. The **natural starter lake footprint is deliberately broader than its navigable port graph inside the six fixed squares**, but strict pixel review still identifies a small mismatch at an exterior water mouth:

- At the **north and south exterior boundaries only**, the water outlet must meet the 88/220 centred port (pixels approximately 666–870 in the 1536px master). The internal lake is allowed to be wider as part of a continuous fixed scenic region.
- The painted scene spans the middle horizontal starter seam with a wide lake. That is acceptable **only inside the fixed six-square composition**: its navigable centreline still connects the W/W graph, and decorative lake water may cross fixed interior scenic seams without declaring new exterior ports. Player-placeable tiles retain the strict port rules.
- A severe whole-image horizontal warp was rejected because it distorted architecture. A much gentler exterior-mouth adjustment and lower-row vertical path alignment were accepted visually, with no blur and no artefact collar. Slight external mouth overspill remains and must be corrected before approval.

**Do not apply blur, opaque collars or a fake canal stripe to conceal this problem.** The painterly shorelines must be recomposed or retouched while retaining their brushwork and exact port locations. See `scripts/check_lake_painted_art.py` for pixel QA.


### Narrow-scoped art contract refinement

A natural lake can occupy more of the *six fixed starting squares* than the 88-unit navigation-port corridor. Its visible scenic polygon and the scoring/travel centreline are different layers. At interior seams between **permanently fixed** lake squares, the image may show a wide connected lake, including coves, without obligating all that water to be new external W ports. The two north/south **outer** ports remain strictly 88 units wide, and all roads between starter squares must connect at the exact defined pedestrian port centres. This exception does not change the rules for newly placed tiles. It should be reviewed as an explicit art-contract change before approval.

## Acceptance gate to switch on production art
1. Place all six exported WEBPs in `assets/lake/`.
2. Retouch any remaining *exterior* north/south water-mouth overspill without distorting the painting. The broad lake footprint across fixed interior seams is intentional; keep the centreline navigable water and route anchors valid.
3. Verify the five-roof bridge walkway crosses both internal street ports at world y=330 (pixel y=768), meeting the pagoda and breakfast-house destinations. The supplied painting was vertically aligned for this, but inspect at close zoom.
4. Run `python scripts/check_lake_painted_art.py` (requires Pillow and NumPy), `node tests/smoke.cjs`, and `node tests/scoring-contract.cjs`.
5. Perform a real-browser visual QA pass with the complete six-square lake and ten outward tiles at far and close zoom.
6. Obtain historical/art-direction review before claiming authentic eighteenth-century Yangzhou detail.
7. Only after passing, set `assets/lake/manifest.json` `status` to `approved`, then merge/deploy.

## Known related gameplay issue
The northern teahouse currently has a local path but **no street-access connection**. The original street-access scoring criterion therefore remains unmet. A painting cannot silently create eligibility; this requires a rules/layout change before scoring can be implemented.

## 10 November 2026: painted art shown by default, port mouth corrected

The initial staging blocker has been addressed for the **fixed six-tile landscape**: the southern W-port's left bank was locally moved about 27px at the 1536px art-master scale, tapering smoothly within the lower 80px. No bridge, pagoda or building was warped. Both external water mouths now match the 88/220 port. Six corrected, square 512px WebP files are installed.

The lake manifest is now **`review` and displayed by default**, replacing the flat top-down vector prototype. This does **not** mean historical or artistic acceptance. The 13×4 expansion paintings are also in review; see [the new painterly visual standard](PAINTERLY-TILE-ART-STANDARD.md) and [deck review log](PAINTERLY-DECK-REVIEW.md). Earlier notes in this document about staged-only preview and the unfixed southern mouth are retained as historical context and superseded by this update.
