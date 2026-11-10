# Expansion artwork review log — 52 painterly variants

**Revision:** 2026-11-10 · **State: review, not production-approved**

## What changed
The expandable board now has 13 distinct tile archetypes with four directly rasterised 512×512 compass-upright paintings each (52 cells). To keep loading responsive, each archetype's four independent paintings are packed into one **lossless 1024×1024 WebP atlas**. `deck-painter.js` samples the correct atlas cell using the actual `archetypeIndex` and `rotation` stored by the game. It never draws thick vector S/W stripes or a blurred collar over the painted master once it has loaded.

The sources are the six detailed Slender West Lake watercolour tiles. Reproducible art code and provenance are in `scripts/build_painterly_deck.py`. A lossless edge profile makes opposing L/S/W boundary pixels match. This is a painterly **recomposition from existing high-detail references**, not a claim of 52 newly commissioned independent illustrations. The roof orientation stays consistent even when the route signature rotates.

The fixed starting lake is now painted by default. Its south canal exit was adjusted locally by about 27 source pixels to meet the centred 88-unit water opening without distorting the five roofs or eastern house.

## Automated checks
- 13 archetypes, four compass-upright variants each; 52/52 distinct pixel compositions after garden-source correction.
- All matching L, S and W edge profiles are pixel-identical away from the corner guard, using lossless WebP. Ports remain 44/220 and 88/220 world units.
- Both outer north/south starting W mouths are navigable and aligned; the two fixed bridge street connections remain logical S ports.
- `node tests/smoke.cjs` checks asset names, signatures, placement identities and all ten outer ring positions. `python scripts/check_painterly_deck.py` checks binary dimensions, hashes, route profiles and static visual-detail variance.
- The artwork preview/gallery is at `tile-art-review.html`. A complete 16-tile ring was also assembled locally from the painted tiles and manually inspected.

## Current visual score — preliminary, not human sign-off
Using the mandatory 0–3 rubric in [the standard](PAINTERLY-TILE-ART-STANDARD.md):
| Criterion | Preliminary | Evidence / caveat |
|---|---:|---|
| Painterly detail | 2 | Real ink/watercolour trees and buildings; some generated route treatments feel mechanical |
| Orthographic viewpoint | 3 | No front-facing buildings or horizon |
| Compositional distinctness | 1 | Variants are pixel-distinct but source trees, gates and pavilions are visibly reused |
| Scoring-topology correctness | 2 | External ports line up; destination/landing illustrations need closer review |
| Seam continuity | 2 | Edge pixels match but natural banks and sidewalks need real-board visual inspection |
| Close-zoom quality | 2 | Strong source texture; copied sources and routes show inconsistencies at high zoom |

**12/18 — Below the 16/18 production threshold.** These scores are project self-review estimates, not independent art approval. Do not mark `approved` based only on CI.

## Next artwork work to meet the benchmark
1. Replace the mechanically painted **straight, corner, T and four-way road/canal routes** with dedicated, hand-painted paths and natural banks authored from the connector geometry.
2. Commission genuinely distinct teahouse, pavilion, market, basin and courtyard arrangements with historically plausible details, avoiding repeated identical motifs in adjacent tiles.
3. Assemble representative full rings at 1× and 2× using the actual game canvas on desktop/mobile, check all edge pairs and rotated cases; attach screenshots and annotate failures.
4. Confirm historical/scoring detail: bridge underpass vs walkway, basin terminus, courtyard enclosure and tea access. Fix the northern teahouse's outstanding access issue separately in the scoring model.
5. After human visual acceptance, edit `assets/tiles/painterly/manifest.json` `status` to `approved` and record reviewer/date. Do not change `status` merely to silence a QA warning.

## Compare old and new
The default game shows painted lake and painterly expansion art. `?tileArt=legacy` is a deliberate comparison of the older mixed/fallback renderer, not the preferred style. For the detailed 52-cell gallery open `tile-art-review.html`.

No changes have been made to the seven-activity scoring engine; the scoring rules remain a design contract until the actual gameplay implementation is completed.
