# Painted asset integration — Yangzhou

## What's in the game now
- A **seamless six-tile starter painting** built from `starter-panorama.webp` and rendered as one world-space image. The start layout is 3 columns × 2 rows so the painting's native 3:2 crop can be drawn without stretching or a visible grid.
- Three detailed 1024 × 768 painted views for the Five-Pavilion Bridge, canal-side breakfast and White Pagoda garden, available from the **Paintings** button and when inspecting matching tiles in Explore mode.
- New, rotatable tile archetypes now use `painted-tiles.js` to create full-tile composites from the four approved painted assets, with textured canal and street strips aligned to the edges demanded by the placement rules. The older procedural renderer remains the fallback if paintings cannot load. **These composites are a bridge to bespoke production artwork:** they reuse image fragments, so some junctions and architecture may still be visually imperfect.
- Water glints and subtle foliage motion continue. Mismatched vector demo actors are hidden over the full painting at normal/detail zoom until painted character sprites are made.
- The artwork is local to the GitHub repository; no expiry-prone image URLs, external API calls or cookies.

## Starter tile topology (N, E, S, W)
| (x,y) | Scene | Edges |
|---|---|---|
| (0,0) | Willow Causeway | L, L, S, L |
| (1,0) | Northern Lake | W, L, W, L |
| (2,0) | Lakeside Gardens and Teahouses | L, L, S, L |
| (0,1) | White Pagoda Garden | S, S, L, L |
| (1,1) | Five-Pavilion Bridge | W, S, W, S |
| (2,1) | Southern Landing and Breakfast House | S, L, L, S |

The canal runs through the centre column. The bridge tile connects the walking route across the lower row, with the waterway passing under it. Gameplay connectivity is independent of exact imagery; future assets should match connection geometry visibly, especially where a new tile meets the fixed painting.

## Rendering and memory
- `painted-assets.js` asynchronously loads all four local WebP images and invalidates the main canvas when they arrive.
- `YangzhouPainted.drawStarterAtlas` renders the starter as one image in world coordinates `(0,0)…(660,440)`. This prevents internal tile seams even while zooming and panning.
- `YangzhouTileArt.draw` caches a 3× raster for new tile archetypes, combining locally stored painted source crops with geometric edge-aligned water/road texture bands, retaining placement validation and 90° rotation.
- `YangzhouArt` remains a fallback if an image cannot load; it also paints the tile preview before assets become available.
- The HTML `<dialog>` gallery loads full-resolution image variants and supports previous/next navigation and keyboard close.

## Limitations and quality gates
1. **Cultural accuracy:** These images are newly generated *style demonstrations* rather than verified depictions of an actual historic street. No original Qing painting or museum photograph is embedded. Complete a regional and period-specific source review before calling them historically authentic.
2. **Illustration consistency:** The starter panorama and close-up pictures are separate illustrations, not pixel-perfect crops of the same 3D scene. Their colour and motifs match, but object positions should not be treated as historically exact.
3. **Rotatable tile seams:** The fixed starter is seamless internally. New tiles now receive full-bleed painted source imagery with edge-accurate texture strips, but different samples can still leave visible illustration-to-illustration or starter-perimeter seams. Bespoke paints for every topology are still required.
4. **Life animation:** The scene has subtle environmental motion. A proper set of animated, painterly people and boat sprites with network-based destinations is the next step.
5. **Mobile:** Keep the view high and the controls minimal; the user should be able to pinch into close detail without losing the location.
6. **Performance:** Verify frame time and memory on at least one midrange mobile device when adding full tile sets.

## Production asset pipeline (next iteration)
1. Create a per-tile painted ground layer with standard road/canal exits at the exact centre of edges.
2. Create independent roof, foliage, food, people and boat layers, including orientation variants for directional silhouettes.
3. Establish 2–4 visual variants of each topology to avoid repetition. Store palette, source references, alpha channels and animation anchors in the manifest.
4. Introduce dynamic road/canal graphs, traveller targets and correct occlusion ordering.
5. Add player-owned activity pieces and completion/return/scoring logic; never conflate scoring people with ambient residents.

## Testing
- `node tests/smoke.cjs`: edge matching, tile rotation, placement, camera and interaction regression tests.
- `tests/visual.cjs` through `.github/workflows/visual-qa.yml`: browser screenshots at overview/detail on desktop/mobile, image load verification, dialog interaction, basic placement.
- Continue manual cultural and artistic review; automated tests cannot certify visual or historical accuracy.
