# Artwork V2 — a clean tile-first restart

**State:** Pass 1 — eight independent composition studies; **NO production artwork approved**  
**Started:** 10 November 2026  
**Branch:** `feat/artwork-v2-clean-reset`

## Why this is different

Our previous iterations cropped a broad landscape painting into many tiles or applied road/water geometry to an image afterwards. This repeatedly produced duplicated buildings, artificial rivers, conspicuous joins and artwork inconsistent with the camera. We have deleted those active pipelines and retained their history. **This stage designs *what each square must contain* before painting begins.**

The 8 `tile-art-v2.js` studies are *geometry and composition sketches only*; they are intentionally not called hand-painted or acceptable game illustrations. The six older 512px lake paintings are kept because they are the closest benchmark to the desired style. Their own shore-port and historical details still require review.

### Connections and space

- Square: 220 world units; image at least **1024 × 1024** pixels for detail zoom.
- Edge sequence: `[N,E,S,W]` with `L` land, `S` stone walking street **44** units wide, `W` navigable water **88** wide, all at centred ports.
- Topology rotations: four quarter-turn edge signatures, but **do not rotate roofs or characters**; each variant is an independently composed upright painting.
- Never create a tiled image by cropping a larger painting or mirroring/stamping identical houses. Reuse can inspire a visual language, not a composition.
- Paint roads, waterways and their banks **into** the image from the beginning. Do not draw a generic overlay above finished artwork, blur edges, use an opaque edge collar, or cover landmark details.
- Waterways should actually connect internally. Stone bridges keep water below and street above as two distinct traversable graphs. No street can dead-end in decorative lawn.
- Fixed lake exception: naturally wide scenic water may cross **internal seams of the six permanent cells** without creating new exterior water-port rules. The north and south *outside* mouths must still match precise 88-unit W ports.

## Eight specifically composed tile briefs

| ID | N/E/S/W base | Visual story | Detail / placement guidance |
| --- | --- | --- | --- |
| `garden-grove` | LLLL | Private willow and rockery garden | Intimate asymmetrical courtyard, bamboo, detailed ornamental rocks; no invented roads |
| `street-straight` | SLSL | Stone street with houses and walled gardens | Continuous paving, narrow drainage, different courtyard profiles on each side |
| `street-bend` | SSLL | Turning lane around a neighbourhood corner | Corner paving naturally curves; vernacular roof diversity; a memorable small shrine or shop |
| `market-cross` | SSSS | Four-way market crossroads | Four individually distinctive quarters, trade stalls and fabric canopies, walking routes clear |
| `canal-straight` | WLWL | Willow-lined waterway and riverbank houses | Fine water reflections, usable navigable breadth, varied stone/mud banks, quiet mooring detail |
| `canal-bend` | WWLL | Water turns past planted banks | Paint a true curved shoreline, varied vegetation and distant courtyard glimpses |
| `stone-bridge` | WSWS | Small footbridge over navigable canal | Stone deck and parapets correctly separate the walking route from water below |
| `canal-junction` | WWWL | Three-way canal meeting with garden bank | Widened natural meeting pool, asymmetrical banks, readable separate water arms |

### Fixed lake reference

The six 512×512 WebPs in `assets/lake/` are retained as a *reference, not an approved template for auto-cropping or repeating*. The current prototype can show them together so artists can compare expansion work against the benchmark. They need **exact exterior north/south mouth inspection**, bridge-destination/route validation and historical review before they can be promoted to finished starter assets. They must not be used as an expansion-tile texture library.

### Asset file contract for the next pass

`assets/v2/manifest.json` declares the eight tile IDs, their topologies and 4 compass-upright variants apiece (32 painting slots). Each variant currently has `artwork:null` and `status:needs-independent-painting`. Once art exists, export each original `webp` or `png` **as its own complete square** at >=1024 pixels, add an exact relative path and checksum/provenance; do not mark the full deck approved while slots are incomplete. The renderer may preview a review image when present, but the manifest's state remains `review` until human approval.

The `tile-lab-v2.html` gallery exposes all four rotations of every archetype. Its complete starter+10 ring demonstrates *logical* joining only; future proof must demonstrate **painterly continuity** at overview and close zoom on desktop and mobile, not simply pixel equality at a border.

## Quality gate before expanding beyond eight

1. Commission or paint **one entirely original master tile**, with four planned compass-upright versions. Do **not** produce 52 images or new art pipelines first.
2. Compare each against the accepted detailed lake illustration; use actual square assets in the browser at 1× and >=3×, alongside a selection of legal neighbours.
3. Grade the 6 categories from 0–3: painterly detail; overhead perspective; compositional distinctness; route/destination correctness; seam continuity; close-up quality. **At least 16/18, none below 2**, with annotated screenshots and explicit reviewer acceptance.
4. Only after that pilot succeeds, develop the other seven families (31 further original images). If this fails, revise the art process, not the output-count target.
5. Historical/cultural review is a separate gate, including bridge engineering, White Pagoda form, gardens, period-specific rooftops and market details.
6. Keep moving people, boats and wakes out of the static base. Reintroduce actors only after proper connected road/water paths exist; today's old motion layers are retired.

**Do not merge this review branch to production as a quality-approved art drop.** It is a stable reset of the artwork system and a testable new starting point.

## Clean-up boundaries

Preserved: the camera, pan/zoom/pinch controls, legal placement engine, canonical edge rules, six detailed reference squares, `scoring-tile-spec.cjs`, scoring documents and design research.

Removed on this branch: legacy vector/orthographic and tiled artwork renderers, repeated garden and road/canal WebPs, the sliced panorama/gallery, masks and reconstructed moving-actor cutouts, the old edge-wash artist and outdated generation scripts, and their obsolete QA workflows. All removed bytes remain available in Git history.

Tests: `node tests/smoke.cjs`, `node tests/v2-contract.cjs`, `node tests/scoring-contract.cjs`, and Playwright QA through the workflow. Technical green status is not artistic approval.
