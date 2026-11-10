# Yangzhou · A Living Scroll

A peaceful tile-laying game inspired by historic Yangzhou and Carcassonne. The aim is a connected **top-down city painting** that looks beautiful at overview and close zoom, with authentic Jiangnan garden and waterside details.

## Artwork reset — 10 November 2026

The earlier tile-art generators, sliced panorama fallback, texture overlays and reconstructed clean-plate/actor demonstrations were retired on the **artwork V2 feature branch**. They remain recoverable through Git history; they are not loaded into the new prototype. We are keeping the camera, legal N/E/S/W placement rules, and the scoring *design*.

**[Open the playable tile-layout study](index.html)** · **[Inspect all eight compositions and the 16-square ring](tile-lab-v2.html)**

This is deliberately **not a finished painterly tileset**. The eight new layouts are original *composition studies*, drawn specifically for their own street/canal connection signatures. They contain no crop of the previous painting and do not claim to be watercolour originals. The six detailed existing Slender West Lake tiles remain an **art-direction benchmark and provisional starter scene** while its exact external water mouths and other artistic issues are reviewed. We will not silently swap the game to a low-quality art fallback again.

### First painted street pilot — PR #13

A detailed 1254px original painting for the **west–east stone-paved street** has been accepted as the visual direction. The road must be attached to `street-straight` **rotation 1** (`LSLS`), without rotating the art or buildings. Until a full-resolution binary is uploaded into the GitHub repository, this remains **an externally supplied review candidate**, not part of the deployed art pack.

- **[Open the street pilot review page](street-pilot-review.html)** — load the conversation-generated original PNG, inspect the 20%-wide port guide, side-by-side repeated seam diagnostic, 1×/3× zoom, and an honest visual quality rubric.
- **[Open the playable camera](index.html)** — click **Load painting**, select the same original PNG, and test its live placement at the east–west orientation.
- **[Artwork review contract](docs/ARTWORK-V2.md)** — specifies exactly what remains before the pilot can be promoted to a production master.

The 32-variant manifest explicitly declares **one candidate awaiting its master** and 31 still-blank painting slots. A technically successful test **never** means the painting's border geometry has been approved.

### What is in this proof of concept

- Eight deliberately small tile archetypes, each with four distinct compass orientations: garden, straight street, turning street, market crossroads, straight canal, canal bend, bridge, canal junction.
- Exact edge contracts: `L` landscape, `S` 44/220-wide street, `W` 88/220-wide navigable water; routes join at edge midpoints. Bridges have separate road and water graphs.
- Six fixed Slender West Lake **reference paintings** with eight land-only exterior edges and north/south navigable outlets. The ring inspector assembles all ten immediate neighbours without inventing streets through the lake.
- A live preview and gallery that distinguish **layout study** from independently painted production artwork.
- An explicit manifest for **32 commissioned square masters**. All slots currently say `needs-independent-painting`: no fake claims of 52 production-ready pictures.

### Controls

Drag or arrow keys to pan. Wheel/pinch to zoom, Fit to show the city, 1/2/3 for overview/street/detail views. Select a tile with Previous/Next, rotate it with R, select a dotted matching space, and click **Place tile**. Explore city hides placement hints. [Tile studies](tile-lab-v2.html) opens the new composition QA studio.

### Developer verification

```bash
node tests/smoke.cjs
node tests/v2-contract.cjs
```

Browser QA runs with the Playwright workflow `.github/workflows/visual-qa.yml`. A successful test run checks *mechanics and geometry only*, never art quality. See [artwork V2 and acceptance criteria](docs/ARTWORK-V2.md) and [game design](docs/DESIGN.md).

**No production-art approval has been given.** No scoring engine, multiplayer, final actors or finished expansion painting set exists yet. Make a human-reviewed painting for one tile at four orientations, prove it joins beautifully in several real layouts, and only then extend the deck.

## Historical and art direction

The setting is late eighteenth-century Yangzhou. The White Pagoda has the silhouette of a bottle-form stupa; Five-Pavilion Bridge crosses navigable water with a separate elevated pedestrian route. Avoid generic fantasy architectural elements and later-period anachronisms. The six lake paintings are a visual target, not permission to reproduce their fragments. Before release, the result requires art and local historical review. The painted references and the project's original research notes are preserved in Git history.
