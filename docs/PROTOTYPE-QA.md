# Camera and art proof-of-concept QA

## Scope and limits
This prototype is a **functional interaction sketch**, not finished commissioned artwork or a complete game. Tile visuals are original Canvas 2D procedural drawings. The White Pagoda is deliberately a bottle-shaped stupa; architectural detail still requires local-historical review. Ambient boats/pedestrians cross the fixed starter-scene route; future work generalizes them to the live, expanding transport graphs.

## Manual checks to perform in a browser
- Open index.html on a desktop browser; there should be six fixed lake tiles with roads and continuous north/south water. No external libraries or network are required.
- Drag the canvas; camera pans; controls remain fixed. Use arrow keys for keyboard pan.
- Wheel over a specific building; zoom should keep that location under the pointer. Zoom limits are bounded. Press Fit to restore board framing.
- On mobile, test one-finger pan and two-finger pinch, particularly possible gesture conflicts.
- Use Next / Previous to inspect all 12 archetypes. Rotate through 0/90/180/270 degrees and confirm the edge orientations follow the preview. Tile selection resets on rotation or archetype change.
- Click a dashed candidate space. Place tile should become enabled only for valid matching edges. Clicking an occupied tile should never overwrite it.
- After placement, the tile count increases by one and another tile becomes selected in the panel. Zoom/pan still work with an expanded city.
- Motion on/off freezes or resumes foliage, water and the ambient overlay. Test operating-system reduced-motion preference.
- Inspect bridge underlay: street spans left/right; water north/south; pedestrians should cross the horizontal route while a boat crosses vertically.
- At a close zoom inspect roof linework, miniature figures, bank shapes and foliage. At overview judge whether the tile seams and regional silhouettes read coherently.

## Known limitations / next pass
- Cross-tile pedestrians and boats currently demonstrate the starter spine; general pathfinding through newly placed tiles is not built.
- Drawings are procedural placeholders of the intended handscroll approach rather than final high-resolution painted assets.
- Character animation is basic and does not have destination-based AI or production-quality environmental motion.
- No player turn manager, score state, token pool, feature completion or saved games.
- Current selection highlights are simplified. No completed network graph visualization.
- The conceptual archetype deck is not balanced or randomised; player manually cycles tile types for art testing.
- No automated browser screenshot/performance/cross-device validation has been run by this change.
