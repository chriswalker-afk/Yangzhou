# Orthographic lake artwork — concept pass

This branch introduces `orthographic-lake.js`: a six-square **true overhead** landscape prototype, replacing the perspective-heavy garden collage as the default starter artwork.

## Art construction
- Six separate 1024×1024 SVG images are generated from a single global world-space drawing and individually loaded in the browser.
- The map is orthographic: building roofs, foliage, lake surface and the pedestrian bridge are all laid out in plan view. There is no perspective horizon.
- All neighbouring pixels are sampled from the same geometry. **No feathering or blur is applied between the six fixed tiles.**
- The 3×2 composition has a north/south water channel, an east/west bridge, a pagoda garden in the southwest and a breakfast house in the southeast.
- The top and bottom canal openings are exactly 88 world units wide, centred at x=330. The outer edges otherwise remain land. The bridge's walkway joins the western and eastern destination tiles.
- All six tiles remain separate board objects with unchanged scoring topology.

## Limitations
This is a **vector concept pass**, not finished high-detail hand-painted artwork. The separate image-generation reference is not embedded in the repository. Generated SVG imagery currently omits a fully accurate five-roof bridge silhouette and fine historical detailing. In particular, path geometry, tree placement and landscape-edge contracts should receive screenshot QA before merge, and outer tile additions still need their own matching artwork. The SVG artwork is rendered from common geometry, so it is coordinated but not six independently painted master compositions.

## Next art pass
Create six independently painted orthographic high-resolution masters from the approved concept, keeping exact shoreline/port coordinates and all moving boats/people on separate transparent layers. Review a 3×2 screenshot and ten-tile outer ring before approving production.
