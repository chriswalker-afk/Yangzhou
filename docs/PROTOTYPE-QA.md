# Camera and art proof-of-concept QA

## Scope and limits
This prototype is a **functional interaction sketch**, not finished commissioned artwork or a complete game. The fixed six-tile lake and three detailed scenes now use actual generated painted images stored locally in `assets/painted/`. Rotatable tiles use painterly source-image composites with procedurally enforced water/street edge geometry. These remain transitional and have not yet been painted individually. Historical and architectural authenticity has not been independently reviewed. Full painted actor movement and general connected traffic remain future work.

## Manual checks to perform in a browser
- Open index.html on a desktop browser; there should be a single seamless **3 × 2** painted lake composition covering six fixed tiles, with an underlying centre-column north/south canal. No external libraries or network are required.
- Drag the canvas; camera pans; controls remain fixed. Use arrow keys for keyboard pan.
- Wheel over a specific building; zoom should keep that location under the pointer. Verify smooth easing and bounds. Press Fit/City (1) to restore board framing; test Street (2) and Detail (3).
- On mobile, test one-finger pan/tap and two-finger pinch with no duplicate pointer gestures. Check viewport size/orientation, zoom controls and the bottom panel.
- Use Next / Previous to inspect all 12 archetypes. Rotate through 0/90/180/270 degrees and confirm the edge orientations follow the preview. Tile selection resets on rotation or archetype change.
- Click a dashed candidate space. Place tile should become enabled only for valid matching edges. Clicking an occupied tile should never overwrite it.
- After placement, the tile count increases by one and another tile becomes selected in the panel. Zoom/pan still work with an expanded city.
- Motion on/off freezes or resumes subtle water/foliage accents. At normal/detail zoom, confirm that old simple vector figures do **not** float over the painting. Test operating-system reduced-motion preference.
- Inspect bridge underlay: logically the street crosses east/west while the canal runs north/south; visible painterly geometry may not yet align at every perimeter edge. No figure or boat should float outside the starter image.
- At close zoom inspect the **painted texture itself**: roof-tile lines, miniature figures, breakfast details, lattice windows, rockeries, willow branches and bottle-shaped pagoda silhouette. At overview judge whether the six-tile atlas reads as one coherent handscroll.
- Open **Paintings**: verify the panorama and all three detailed images load at 1024px+ resolution; navigate forward/back, close with Escape, and test mobile dialog clipping.
- Toggle Explore artwork and confirm placement outlines disappear, then return to Place tiles mode and verify placement still works.
- Zoom repeatedly to detail and back; check that adaptive cached images do not flash or overrun memory, and that offscreen tiles are culled.

## Automated checks
- `node tests/smoke.cjs` tests the six starting tiles' edge topology, tile rotations, placement, zoom anchor and presets, pinch gesture, fit, and motion toggle using a lightweight simulated Canvas and DOM.
- GitHub Actions runs the same checks automatically on pushes/PRs.
- These tests **do not** render screenshots or verify historical fidelity, art quality, performance or device-specific browser behaviour.

## Known limitations / next pass
- Cross-tile pedestrians and boats currently demonstrate the starter spine; general pathfinding through newly placed tiles is not built.
- The starter and four gallery views use real high-resolution painted images; rotatable tiles currently reuse cropped painted imagery, and are not yet individually illustrated or historically validated.
- Character animation is basic and does not have destination-based AI or production-quality environmental motion.
- No player turn manager, score state, token pool, feature completion or saved games.
- Current selection highlights are simplified. No completed network graph visualization.
- The conceptual archetype deck is not balanced or randomised; player manually cycles tile types for art testing. Most playable tile families still lack independent painted variants.
- Starter image is seamless **inside** its six-tile region, but seams may remain where composited new tiles touch it.
- Playwright desktop/mobile screenshot QA is available in `.github/workflows/visual-qa.yml`; review the screenshots manually before merging. Device performance and cultural accuracy still require independent review.
