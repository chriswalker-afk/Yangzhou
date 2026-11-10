# Yangzhou V2 — first street / independent-neighbour quality gate

**Status: review, not approved.** As of 10 November 2026, one painted tile exists: `street-straight-east-west.png`. It is the original user-approved 1254×1254 PNG imported to GitHub in PR14. This pass adds analysis and a *real-original-to-original* joining laboratory. **It does not replace, repaint, stretch or procedurally cover the painting**, and it does not claim any second original tile exists.

## Why this pass matters

The original painted street is an excellent art-direction pilot, but its horizontal road mouths are visibly narrower than the legal edge-port contract. The first demonstration repeated copies of the *same* tile; those repeats do not establish believable variety or edge continuity with a genuinely different painting. Before moving on to 32 art variants, both weaknesses must be addressed explicitly.

### Road mouth geometry (exact)

| Dimension | Contract | For 1254px original |
| --- | ---: | ---: |
| Square | 220 world units | 1254px |
| Street width | 44 world units (20%) | 250.8px |
| Centreline | y = 110 world units | y = 627px |
| Upper road edge | y = 88 (40%) | y = 501.6px |
| Lower road edge | y = 132 (60%) | y = 752.4px |
| External ports | **west and east only** | `LSLS` N/E/S/W |

The current painting appears to have a paving opening roughly **Y≈550–710px** at both borders: **~160px**, about **13%** of the square. These limits are **visual estimates**, not a certified pixel segmentation: tree shadows, stone walls and foreground flowers complicate automatic colour identification. At minimum, the painting needs a ~90px increase in total paved height across the *two outside boundaries*, while keeping the rest of the composition proportionate. A painter should achieve the whole 20% entrance width naturally in the illustration, not fake the missing width with border stripes.

The exact original **must be retained** as a stable reference. A painted edit becomes a *new reviewed master* (with provenance), not an overwrite of the only saved 1254px original.

### A numerical diagnostic is not visual approval

For a **self-repeat** of the original street, comparing the last pixel column with the first gives a mean absolute RGB-channel difference of approximately **35/255 over the entire vertical edge** and **24/255 across the required road-port band**. A non-zero mismatch indicates the opposite edges are not photometrically identical. A zero mismatch would still *not* establish artistic quality: real stone paving, shadows and architecture should vary naturally.

The new [painted-neighbour laboratory](../painted-neighbour-lab.html) displays the original without transformations, with red 44/220 port guides, 1×/2×/3× inspection, exact topology tests and a mean-channel difference for **two genuinely different originals**. Until a second independently painted image is loaded, the second slot is deliberately blank and no seam metric or quality approval is shown.

## Two next hand-painted asset briefs

We will produce **one** of these before expanding the deck; both require a complete individually composed square (at least 1024px) with art to the boundaries and compass-upright architecture.

**Option A — separate east–west neighbourhood, `street-straight` rotation 1 (`LSLS`).** Use the same restrained ink-and-watercolour palette, 18th-century Yangzhou Jiangnan garden architecture and directly overhead orthographic viewpoint. The 20% stone-paved lane should run continuously from the left midpoint to the right midpoint, across the entire painted width. A small craftsman's courtyard with a wood lattice doorway on one side and an enclosed garden with white plaster walls, a stone alcove and a willow on the other. Different rooflines, tree placement, paving and courtyard gates from the existing master; no copied original details or background figures. Because the new tile is to join the old on E/W, matching the *visual* seam must be deliberate, not only a palette match.

**Option B — private garden, `garden-grove` (`LLLL`).** Above or below the street tile, a unique whole-square garden dominated by an asymmetric rockery, small water bowl or pond, painted pines and a covered corridor. No external roads or water; buildings, hedges and courtyard walls must match the neighbouring *land* edge in height, perspective and texture. This tests whether land-to-land geometry can feel continuous outside the six fixed-lake scenes.

Neither candidate is considered production-ready until both the individual painting and an assembled landscape have been reviewed in the browser. A generated *report board* or **cropped section from a collage is not a tile master**. In particular, no automated scores or PR labels generated in an image should be accepted as evidence.

## Acceptance for the first pair

1. Source identity: original, >=1024px square, with unique digest; do not silently reuse the existing street painting as a distinct image.
2. Geometry: edge signatures correctly line up in canonical N/E/S/W order; painted geometry passes the 44/220 street-port check, not just the logical edge letters.
3. Visual scale: inspect at 1× and at >=3×. Compare the actual painted seam in both directions with no blurred strips or edge overlays in the game artwork.
4. Art-direction rubric: >=16/18, and every category >=2, signed off by a human reviewer. Quality of two different painted tile compositions, diversity, close zoom and period authenticity must be reviewed separately.
5. Preservation: keep the first reference PNG and raw painting origin/provenance recoverable in Git history. Add genuinely edited images only with source attribution and review status until the human pass is complete.

**No automation may mark the visual acceptance gate as passed.** Technical CI can confirm image dimensions, files, topology, hash distinctness and that the joins can be inspected; it cannot authoritatively score painterly realism, historic authenticity or natural road widths.