# Yangzhou · A Living Scroll

> **Artwork V3 material pilot (12 November 2026):** A layered, reusable material-and-sprite rendering pipeline is being tested **separately from the unchanged V2 game**. The original accepted grass, stone and canal-water lossless WebPs are now committed under [`assets/v3/materials/`](assets/v3/materials/) on PR #20. Open the [six-tile material lab](layer-lab-v3.html) to inspect world-aligned textures, exact road/canal mouths, and 3× zoom. All three binaries are mandatory and SHA-256/dimension-checked in CI; browser file selectors are optional for comparing local alternatives. These are **accepted candidates, not production-approved artwork**. See the [V3 specifications and review gates](docs/ARTWORK-V3.md). Existing V2 artwork, manifests, gameplay and tests are unchanged.

A peaceful tile-laying game inspired by historic Yangzhou and Carcassonne. The aim is a connected **top-down city painting** that looks beautiful at overview and close zoom, with authentic Jiangnan garden and waterside details.

## Artwork reset — 10 November 2026

The earlier tile-art generators, sliced panorama fallback, texture overlays and reconstructed clean-plate/actor demonstrations were retired on the **artwork V2 feature branch**. They remain recoverable through Git history; they are not loaded into the new prototype. We are keeping the camera, legal N/E/S/W placement rules, and the scoring *design*.

**[Open the playable tile-layout study](index.html)** · **[Inspect all eight compositions and the 16-square ring](tile-lab-v2.html)**

This is deliberately **not a finished painterly tileset**. The eight new layouts are original *composition studies*, drawn specifically for their own street/canal connection signatures. They contain no crop of the previous painting and do not claim to be watercolour originals. The six detailed existing Slender West Lake tiles remain an **art-direction benchmark and provisional starter scene** while their external water mouths and other artistic issues are reviewed. We will not silently swap the game to a low-quality art fallback again.

### Two original painted street tiles — PR #16

The two distinct full-resolution 1254 × 1254 PNG paintings have been integrated into the game: [repainted east–west street](assets/v2/street-east-west-repaint.png) and [independently painted neighbouring street](assets/v2/street-east-west-neighbour.png). The [first pilot painting](assets/v2/street-straight-east-west.png) is preserved **unchanged** as an archival reference.

The repaint displays at `street-straight` **rotation 1** (90°); the neighbour displays at **rotation 3** (270°). Both have the same **LSLS** topology (land north/south, paved street east/west). Each is a separate compass-upright illustration; buildings are never rotated.

The [playable board](index.html) and [tile lab](tile-lab-v2.html) load both new masters automatically. [Pair review](street-pair-review.html) shows full original painted squares together at 1× and 3×. [Independent joining laboratory](painted-neighbour-lab.html) measures border discontinuity and offers an optional local test painting. [Street width review](street-pilot-review.html) displays required 20%-wide road port overlays.

The files and their exact SHA-256 hashes are validated in `scripts/validate_street_pair.cjs`. **Both are review assets, not artistically approved**. Actual 44/220 mouth width, natural seam transitions, six-category 16/18 human artwork review and historical plausibility all remain quality gates. Exactly **30 other orientation slots** still show labelled layout studies.

### Expanding the painterly deck — Batch 01

The two east–west streets are the accepted-for-play art baseline. Our next original is a **north–south stone-paved street** (1254px). The same batch also defines a genuine **turning street**, **enclosed garden**, and **north–south canal**, each with its own N/E/S/W connection contract. Their unpainted slots remain clearly marked; there is no cropped panorama or accidental infographic in the game.

The original north–south painting has now been uploaded, verified and added to the live game as the third painted variant. Open the [interactive artwork expansion preview](tile-art-expansion.html) or read the [specific tile painting briefs](docs/ARTWORK-BATCH-01.md). The **street corner** is next; garden and canal remain honest unpainted studies.

### What is in this proof of concept

- Eight deliberately small tile archetypes, each with four distinct compass orientations: garden, straight street, turning street, market crossroads, straight canal, canal bend, bridge, canal junction.
- Exact edge contracts: `L` landscape, `S` 44/220-wide street, `W` 88/220-wide navigable water; routes join at edge midpoints. Bridges have separate road and water graphs.
- Six fixed Slender West Lake **reference paintings** with eight land-only exterior edges and north/south navigable outlets. The ring inspector assembles all ten immediate neighbours without inventing streets through the lake.
- A live preview and gallery that distinguish **layout study** from independently painted production artwork.
- An explicit manifest for **32 independently painted square masters**: three independent 1254px street paintings are imported for review; the other 29 slots need paintings.

### Controls

Drag or arrow keys to pan. Wheel/pinch to zoom, Fit to show the city, 1/2/3 for overview/street/detail views. Select a tile with Previous/Next, rotate it with R, select a dotted matching space, and click **Place tile**. Explore city hides placement hints. [Tile studies](tile-lab-v2.html) opens the new composition QA studio.

### Developer verification

```bash
node tests/smoke.cjs
node tests/v2-contract.cjs
node tests/v3-geometry.cjs
node tests/v3-materials.cjs
```

Browser QA runs with the Playwright workflow `.github/workflows/visual-qa.yml`. A successful test run checks *mechanics and geometry only*, never art quality. See [artwork V2 and acceptance criteria](docs/ARTWORK-V2.md) and [game design](docs/DESIGN.md).

**No production-art approval has been given.** No scoring engine, multiplayer, final actors or finished expansion painting set exists yet. Make a human-reviewed painting for one tile at four orientations, prove it joins beautifully in several real layouts, and only then extend the deck.

## Historical and art direction

The setting is late eighteenth-century Yangzhou. The White Pagoda has the silhouette of a bottle-form stupa; Five-Pavilion Bridge crosses navigable water with a separate elevated pedestrian route. Avoid generic fantasy architectural elements and later-period anachronisms. The six lake paintings are a visual target, not permission to reproduce their fragments. Before release, the result requires art and local historical review. The painted references and the project's original research notes are preserved in Git history.
