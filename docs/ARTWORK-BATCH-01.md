# Yangzhou Artwork Expansion — Batch 01

**Date:** 10 November 2026  
**Branch:** `feat/tile-art-expansion-batch-01`  
**Objective:** Expand the number of original painterly square game images while protecting the two approved-for-play east–west street paintings.

The user is satisfied with the current paintings and wants breadth of playable combinations, not another cycle of microscopic reworking. From this pass onwards, **produce an original image for a single canonical slot, inspect it, then integrate it without rewriting the game engine**. Preserve original full-resolution sources and retain honest review/production status.

## Four compositions — one integrated, three briefs

| Existing tile archetype / rotation | N/E/S/W edges | Image | Current status |
| --- | --- | --- | --- |
| `street-straight:0` (north/south street) | `SLSL` | `street-straight-north-south.png` | **Original 1254px painting uploaded, verified and integrated for review** |
| `street-bend:0` (north→east lane) | `SSLL` | `street-bend-north-east.png` | Composition brief; original painting needed |
| `garden-grove:0` (enclosed willow garden) | `LLLL` | `garden-grove-willow-rockery.png` | Composition brief; original painting needed |
| `canal-straight:0` (north/south canal) | `WLWL` | `canal-straight-north-south.png` | Composition brief; original painting needed |

The three non-tile presentation graphics from unsuccessful generation attempts were rejected. They are **not** image masters, not counted as work completed, and must not be cropped into tiles.

## Working style

Use the two existing square paintings `street-east-west-repaint.png` and `street-east-west-neighbour.png` as the approved-for-play quality standard: a dense overhead, ink-lined, highly detailed watercolor cityscape; Jiangnan whitewashed garden walls, grey tiled rooftops, wood screens, blossoms, bamboo, rockery, and varied hand-set stonework. Design each square from its specific edge geometry outward. Never reuse panoramas, mirror buildings, turn houses sideways, blend seams with an edge wash or introduce poster typography.

Architecture should be plausible for late-18th-century Yangzhou (not automatically claimed to be historically certified). Jiangnan's white walls and dark tiled roofs are a key vernacular reference; Yangzhou merchant gardens include complex circulation, varied corridors, and ornamental perforated walls. Independent external background reading:

- [Canadian Centre for Architecture — White Walls and Black Tiles](https://www.cca.qc.ca/en/articles/issues/33/acts-of-looking/96757/white-walls-and-black-tiles)
- [Buildings — Yangzhou salt-merchant garden windows](https://doi.org/10.3390/buildings15152599)

### 1. North–south stone street — image already created

A full original square, 1254 × 1254 pixels, has been produced. The vertical paved route separates two distinct neighbourhood groups: gray-tiled houses, moon-gate garden, magnolia and scholar rock on the west; a wooden tea room and flowering gardens on the east. No street branches sideways. This painting is **not** a 90°-rotated version of the old east–west tile.

- Filename: `assets/v2/street-straight-north-south.png`
- Exact file length: `4,302,868` bytes
- SHA-256: `e73d1211c750589cb16a8e8020bb2670999a7ebc45332a4b09ad11019fe98ea2`
- Tile: `street-straight`, rotation 0, `SLSL`
- Street exits: N at top X≈502–752 and S at bottom X≈502–752 of 1254px image; no openings E or W.

**[Direct upload for the batch's correct GitHub branch](https://github.com/chriswalker-afk/Yangzhou/upload/feat/tile-art-expansion-batch-01/assets/v2)**

The original 1254px file has been uploaded unchanged. `node scripts/validate_art_batch_01.cjs --require-painted` verifies its bytes and SHA-256. Its canonical `street-straight:0` image is now active in the game at status `review`; no garden, bend or canal painting is claimed to exist.

### 2. Street corner — north to east (`SSLL`)

Paint a 44/220-wide stone street entering at the **north** midpoint and turning 90° to leave the **east** midpoint. Maintain one continuous curve or properly articulated paved corner; no south/west street exit. Place Yangzhou grey-roofed merchant houses, white garden walls, flowering trees, a gate and stone well in the remaining land quarters. Make rooflines compass-upright.

This is the first important *connector*: paired with a north–south street directly north and one of the two east–west streets directly east, the tile will produce a real L-shaped route around a city block.

### 3. Enclosed willow garden (`LLLL`)

A land-only square with **no** external road or canal openings. Original compositional idea: magnolia, scholar rockery, a pond completely inside the boundaries, moon gate, low grey-tiled pavilion and dense bamboo; make it meaningfully different from the garden sections of the existing streets. This provides tranquil rhythm against busy routes and should not look like pasted fragments of the road art.

### 4. Straight willow canal — north to south (`WLWL`)

A north–south navigable waterway with a centred 88/220-wide water opening: approximately **502 pixels of water** at both N and S edges on a 1254px square (X≈376–878). Paint continuous natural jade-gray water and coherent banks across the whole tile, with stone edging, river houses, reeds and willow branches. No side canal E/W and no static boats or animated wake baked into the terrain. It should connect directly to Slender West Lake's northern or southern external mouth.

## 2 × 2 board proof (already legal)

This layout is deliberately small and uses the same canonical topology as the game:

| | West cell | East cell |
|---|---|---|
| North | N/S street `SLSL` | Garden `LLLL` |
| South | Street corner `SSLL` | Existing E/W street `LSLS` |

All internal edges match: the new N/S street meets the corner; the corner joins the already painted E/W street. Garden boundaries close the block. The [batch artwork lab](../tile-art-expansion.html) renders these actual squares when present and clearly marks missing artwork as studies.

## Quality rules and next commits

- Keep the existing pair exactly as uploaded; do not alter or regenerate it.
- New art must be **one original, full-bleed square per slot** with upright roofs, not a large sheet split into squares.
- Game art should be useful at normal board zoom and detailed at 3×.
- Run the source-integrity validator, legal-edge tests and browser QA before updating `assets/v2/manifest.json`.
- The game now has **3 committed original painted variants**. The corner, enclosed garden and north–south canal remain unpainted briefs; do not claim the batch contains four finished paintings until all four files genuinely exist.
