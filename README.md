# Yangzhou · A Living Scroll

A peaceful tile-laying game inspired by historic Yangzhou and Carcassonne. The aim is a connected **top-down city painting** that looks beautiful at overview and close zoom, with authentic Jiangnan garden and waterside details.

## Artwork reset — 10 November 2026

The earlier tile-art generators, sliced panorama fallback, texture overlays and reconstructed clean-plate/actor demonstrations were retired on the **artwork V2 feature branch**. They remain recoverable through Git history; they are not loaded into the new prototype. We are keeping the camera, legal N/E/S/W placement rules, and the scoring *design*.

**[Open the playable tile-layout study](index.html)** · **[Inspect all eight compositions and the 16-square ring](tile-lab-v2.html)**

This is deliberately **not a finished painterly tileset**. The eight new layouts are original *composition studies*, drawn specifically for their own street/canal connection signatures. They contain no crop of the previous painting and do not claim to be watercolour originals. The six detailed existing Slender West Lake tiles remain an **art-direction benchmark and provisional starter scene** while their external water mouths and other artistic issues are reviewed. We will not silently swap the game to a low-quality art fallback again.

### First original painted street master — restored and integrated

The original `1254 × 1254` image is now committed as **[`assets/v2/street-straight-east-west.png`](assets/v2/street-straight-east-west.png)**. Its full 4,108,283 bytes were recovered intact from the Git blob the user uploaded: the byte-for-byte SHA-256 is `bc8fc1cf37b0404dc6620385a6167576692e3aee11bbf7346da28edbb158b2c2`. A subsequent broken two-byte rename was replaced with the genuine original blob, without regenerating, recompressing or changing the painting.

- The live [game camera](index.html) now starts with the original **east–west stone street** selected: `street-straight` rotation `1`, N/E/S/W `LSLS`. The rooftops are compass-upright; the actual artwork is never rotated.
- [Review the original painting and its neighbours](street-pilot-review.html): automatic high-resolution loading, 20%-wide route mouth overlay, 1×/2×/3×, three-square repeat diagnostic and human quality checklist.
- The 31 remaining atlas slots are unpainted; they continue to display labelled topology studies. The original road variant has **review** status, **NOT approved**.
- "Try local revision" permits a temporary, session-only replacement for side-by-side comparison, and "Restore original painting" returns to the repository master without deleting it.
- [Independent painted-neighbour joining laboratory](painted-neighbour-lab.html): compare the original against a **different full-square painting** above, below, left or right at 1×–3×, with legal edges, separate seam strips and a deliberately pending human approval gate. It refuses an exact duplicate of the first PNG.
- [Street-edge acceptance brief](docs/STREET-EDGE-ACCEPTANCE.md): exact 44/220 mouth geometry, observed width shortfall, and distinctly composed neighbour painting briefs; **no mechanical road-strip fix**.

**A working import is not artistic acceptance.** The street currently appears narrower than the 44/220 contract at the exterior mouths (20% of the image = 250.8px, centred at Y≈502–752), and its seams have not yet been approved against *different original paintings*. Human 16/18 artwork scoring and historical signoff remain necessary.

### What is in this proof of concept

- Eight deliberately small tile archetypes, each with four distinct compass orientations: garden, straight street, turning street, market crossroads, straight canal, canal bend, bridge, canal junction.
- Exact edge contracts: `L` landscape, `S` 44/220-wide street, `W` 88/220-wide navigable water; routes join at edge midpoints. Bridges have separate road and water graphs.
- Six fixed Slender West Lake **reference paintings** with eight land-only exterior edges and north/south navigable outlets. The ring inspector assembles all ten immediate neighbours without inventing streets through the lake.
- A live preview and gallery that distinguish **layout study** from independently painted production artwork.
- An explicit manifest for **32 independently painted square masters**: one authentic 1254px original is imported for review, the other 31 slots need paintings.

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
