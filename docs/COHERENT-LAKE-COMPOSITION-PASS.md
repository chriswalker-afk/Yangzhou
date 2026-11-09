# Coherent Slender West Lake composition pass

## Problem addressed
The previous six masters were repeated garden paintings, with a broad translucent green edge treatment on each square. The repetition and wash made a visibly tiled collage.

## Runtime change
The fixed 3×2 starting board now displays six **exactly adjacent rectangles from the existing local clean-plate artwork** (`assets/living/starter-clean.webp`) with **no edge wash** across those six squares. This is an interim visual fix: it removes repeated garden masters and internal feathered bands without changing the scoring-aware N/E/S/W topology. Nonstarter tiles continue using the ordinary independent tile renderer and its edge contract.

**This is a temporary coordinated-atlas fallback, not six finished independent square paintings.** It deliberately relaxes the independent-art rule while the six dedicated assets are produced. The clean plate must be reviewed: its depicted paths and shoreline may still disagree with the final natural-shoreline graph. The separate generated concept painting is a reference, not yet integrated as site assets. The bridge and pagoda may also not be depicted in their correct final positions in the fallback image.

## Production artwork requirements
1. Create a *single* top-down master composition as an art-direction drawing with an irregular north/south navigable lake, an east/west Five-Pavilion Bridge in the bottom centre, the White Pagoda in the bottom left, and a breakfast-house garden in the bottom right.
2. Design it with the 3×2 tile grid overlaid, **but do not paint visible borders, grid lines, or blur collars**.
3. Honour canonical N/E/S/W edges from `tile-topology.js`: eight outer land boundaries, two north/south water openings, and the two internal bridge street connections.
4. Remove any boats and people from the static master; animate those independently.
5. Export six exactly aligned square masters; each square must remain visually coherent when neighbours are placed. At the final stage, replace the temporary atlas sampling with six actual per-tile assets.
6. Check the complete 3×2 starter and mixed surrounding tiles at overview and 2× zoom, without edge washes. A clean seam must result from continuous composition, not post-hoc blur.

## Honest limitations
The fallback's internal seams are mathematically contiguous but its outer edge joins to future independently painted tiles are not guaranteed. Existing edge pixel QA does not certify the new image. This PR is a visual integration improvement, not final historical-art or production-art signoff.
