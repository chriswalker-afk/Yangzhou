# Slender West Lake — overhead painted artwork upgrade

**Date:** 10 November 2026
**Status:** New high-detail painted composition exported into six square WEBPs; **NOT YET DEPLOYED OR APPROVED** because the lake's visual shoreline does not fully meet the fixed gameplay port geometry.

## What was produced
- A new, detailed, near-orthographic 1536×1024 ink-and-watercolour lake illustration, composed as a single coherent scene with **no visible tile grid and no boats or people**.
- Six separate 512×512 WEBP tile exports (the exact files named in `assets/lake/manifest.json`) cropped along mathematically exact 3×2 boundaries. No blur, green collars or seam feathering are baked into any tile.
- Recognisable features from overhead: White Pagoda in the southwest, five distinct pavilion roofs on an east–west bridge across the lower central lake, northeast tea pavilion and southeast courtyard/breakfast house.
- A user-facing ZIP of master painting, individual tile files, and a **review-only** grid overlay. The ZIP is supplied in the ChatGPT conversation, rather than directly attached to this PR, because available GitHub write tools accept UTF-8 text files and Git blobs but cannot consume the generated local binary image files.

## How the game integration works
- `painted-lake.js` only loads the six image files if the manifest status is `approved` and its six filename/edge/coordinate entries match the playable topology exactly.
- Every image must decode and be square with at least 512×512 pixels; the six are activated **atomically**. Partial upload never produces a broken collage.
- When the manifest is `staged`, as it is in this PR, the current overhead generator remains in place.
- `tile-system.js` uses the approved painted assets without transparent apron overlays or old panoramic slicing. It retains the orthographic generator as a safe fallback.
- The page keeps separate boat/pedestrian actor layers; the new base art contains no moving people or vessels.

## The outstanding blocker — strict water-connection geometry
The painting is a stronger visual composition, but automated pixel sampling shows water spilling beyond the canonical W port near the middle horizontal tile boundary:

- Expected water opening at the top, middle and bottom rows: centre at 1.5 tile widths and width 88/220 of one tile (pixels approximately 666–870 in the 1536px master).
- Actual art: the water is broader at the centre join, extending into the outer land-edge regions. This is unacceptable for navigation/edge logic.
- A trial whole-image geometric warp narrowed the channel but distorted the eastern building and foliage, so it was **discarded**.

**Do not apply blur, opaque collars or a fake canal stripe to conceal this problem.** The painterly shorelines must be recomposed or retouched while retaining their brushwork and exact port locations. See `scripts/check_lake_painted_art.py` for pixel QA.

## Acceptance gate to switch on production art
1. Place all six exported WEBPs in `assets/lake/`.
2. Correct the source art's north/south and internal 88-unit water mouths, and the land-only east/west seams, without distorting architecture.
3. Verify the five-roof bridge walkway crosses the two internal street ports at y=330 world units, meeting valid garden/house destinations.
4. Run `python scripts/check_lake_painted_art.py` (requires Pillow and NumPy), `node tests/smoke.cjs`, and `node tests/scoring-contract.cjs`.
5. Perform a real-browser visual QA pass with the complete six-square lake and ten outward tiles at far and close zoom.
6. Obtain historical/art-direction review before claiming authentic eighteenth-century Yangzhou detail.
7. Only after passing, set `assets/lake/manifest.json` `status` to `approved`, then merge/deploy.

## Known related gameplay issue
The northern teahouse currently has a local path but **no street-access connection**. The original street-access scoring criterion therefore remains unmet. A painting cannot silently create eligibility; this requires a rules/layout change before scoring can be implemented.
