# Yangzhou — Production Tile Artwork Pass

**Status:** High-resolution, topology-safe painted tile system implemented and under visual review. This is not a historical authenticity certification or final art director sign-off.

## What a tile is

- The tile's gameplay footprint is exactly **220 × 220 world units**. A single asset is independently authored in **1024 × 1024 pixels**.
- Its edges are ordered **north, east, south, west**.
- **L** is land with no route connection; **S** is a 44-world-unit stone path; **W** is an 88-world-unit navigable water opening.
- All openings are **centred on the side**. Stone curbs and canal banks follow the same port widths for every tile.
- A painted roof, pavilion or tree must stay upright when the *logical* tile rotates. Artwork is generated independently for each orientation rather than rotating a finished image.
- A visual match does not override placement rules: all touching edges must have identical types.

## In the branch

The image-generation script creates **58 separate image files** in `assets/tiles/production/`:

| Family | Output | Quantity |
|---|---|---:|
| Fixed Slender West Lake start | `starter-01.webp` through `starter-06.webp` | 6 |
| 13 playable archetypes | `archetype-00-r0.webp` through `archetype-12-r3.webp` | 52 |
| Metadata, rights and checksums | `manifest.json` | 1 |

Artwork source is the repo's existing standalone high-quality square painting studies, **not** an oversized image of Slender West Lake cropped into six fragments. The script composes painting motifs only in the land-safe portions of a tile, renders route curves from geometric masks, applies matching stone and water textures, and standardises the edge pixel profiles.

The web renderer loads the exact static image for the chosen archetype and quarter turn. It uses a bounded lazy-loading cache rather than preloading every large tile image on mobile. The previous renderer is only a temporary fallback while an image is in transit or unavailable.

## Viewing art quality

GitHub Actions workflow **Generate production-style Yangzhou tile masters** publishes:

- `starter-six.jpg`: individual six starting paintings, readable at a glance.
- `starter-connected.jpg`: six square images assembled as the actual 3 × 2 board.
- `tile-deck.jpg`: four orientations of each playable archetype.

These are generated directly from the WebP assets used by the browser. Examine the starter against the user-supplied reference and judge connected sections, not attractive isolated squares.

The normal browser visual QA additionally takes desktop, detail and mobile screenshots, places another tile, and fills every surrounding perimeter space. If the production manifest exists, it checks that all six fixed master files decode and that no hard RGB seam exists between their internal neighbours.

## Production acceptance gates

- [x] Every fixed cell is a separately authored square file.
- [x] Every selectable archetype has four explicit upright image masters.
- [x] Roads and canals align at fixed edge centres and agreed widths.
- [x] Adjacent tile placement is still validated independently of artwork.
- [x] No boat, walker, smoke, leaf or animation is intentionally baked into the tile layers.
- [x] High-resolution view remains legible at overview and close-up.
- [ ] **Manual approval:** artwork must tell a coherent single landscape across several joins, without repeated roof motifs, stray waterways, abrupt texture bands or incongruous paths.
- [ ] **Artist retouch:** check bridges, White Pagoda silhouette, landmark perspective and colour continuity at high zoom.
- [ ] **Cultural review:** approve architecture, landscaping and historical references before describing the setting as historically accurate.

The automated pixel test enforces edge compatibility, not artistic continuity 20–80 pixels inside the tile; visual judgement remains essential.

## Rebuild locally

```bash
python -m pip install "Pillow>=10,<13" "numpy>=1.26,<3"
python scripts/build_production_tiles.py
python3 -m http.server 8765
```

The generation should be deterministic given unchanged source images and code. Do not manually patch generated WebP files without updating the production source method: changes would be lost on a later rebuild. For bespoke repaints, add distinct clean art studies or author an independent source for that topology and record it in the manifest.

## Art direction notes

Use the approved Yangzhou ink-and-watercolour board-game aesthetic: elevated orthographic-ish views, carefully constructed stone paths and shorelines, rich spring vegetation, willow branches, scholar rocks, pagoda roofs and pavillions rendered at consistent physical scale. Standalone scenes should remain **readable from far above**, with fine detail rewarding zoom.

The source artwork is an original project illustration, but does not establish the date or accuracy of every building; these images are interpretations. This pass does not claim the same quality level as commissioning 58 separately hand-repainted originals. It establishes a complete, consistent high-resolution asset set and the quality gates for the next artist-led improvement.
