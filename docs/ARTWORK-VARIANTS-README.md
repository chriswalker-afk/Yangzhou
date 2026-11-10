# Yangzhou · Painted Tile Variant Package

This package holds **19 distinct full-square original illustrations**, compressed from the original 1254 × 1254 PNGs into **high-quality 1254 × 1254 WebP** images (quality=96) for fast loading and a single GitHub browser upload. The PNG originals remain preserved in the conversation and three are already tracked in GitHub; this package is a **game-ready, quality-preserving WebP transcode, not an archival copy of all PNGs**.

## Artwork coverage

| Tile family | Connector signature(s) | Distinct paintings |
|---|---|---|
| `street-straight` | `SLSL` | 1 |
| `street-straight` | `LSLS` | 3 |
| `street-bend` | `SSLL` | 1 |
| `market-cross` | `SSSS` | 1 |
| `garden-grove` | `LLLL` | 1 |
| `canal-straight` | `WLWL` | 4 |
| `canal-straight` | `LWLW` | 1 |
| `canal-bend` | `WWLL` | 3 |
| `canal-junction` | `WWLW` | 1 |
| `canal-junction` | `LWWW` | 2 |
| `stone-bridge` | `WSWS` | 1 |

Total: **19 original paintings**, **11 exact signature pools**. An unpainted connector signature must continue using the existing clearly-labelled layout study.

The six 512px **Slender West Lake starter** paintings are already committed to `assets/lake/` in the GitHub repository. They are **referenced, not duplicated** in this overlay ZIP; its importer preserves them unchanged.

## One-file GitHub upload

This archive is intended to be uploaded **unmodified** to the branch's `incoming/` folder. GitHub does **not** automatically extract ZIP files into a repository. The companion importer workflow (on the prepared PR branch) validates the package before unpacking `assets/v2/variants/` and `assets/v2/variant-pools.json`. Do **not** simply upload this ZIP to `assets/v2/` on `main` and expect the images to appear in the game.

**Upload destination (when prepared):** `https://github.com/chriswalker-afk/Yangzhou/upload/feat/yangzhou-art-pack-import/incoming`

## Random variations

Only select among originals with the **same archetype and exact edge signature**. For example, an east–west `street-straight` (`LSLS`) can use its three painted alternatives, but cannot use the north–south (`SLSL`) painting. The choices must be **stable per placed tile**; changing the image every animation frame would cause visual flicker. The provided `assets/v2/variant-runtime.js` implements this using a game-specific seed and immutable tile coordinates/seed; no architecture is physically rotated.

## Image coordinates

Every painting remains 1254 × 1254 pixels. Connector types in order N/E/S/W: `L` land, `S` stone street, `W` water. Streets should meet a centred 20%-wide edge mouth (44/220 world units); canal mouths should meet centred 40%-wide water openings (88/220 units). The exact geometry is an art review gate, **not guaranteed** by a matching manifest string or hash.

## Contents

- `assets/v2/variants/<family>/*.webp`: all 19 images as individual **full square** paintings, not sliced panoramas
- `assets/v2/variant-pools.json`: precise per-edge asset manifest with SHA-256 hashes and source provenance
- `assets/v2/variant-runtime.js`: optional stable seeded random variation renderer (intended to load *after* `tile-art-v2.js`)
- `gallery.html`: browsable tile catalogue
- `tile-contact-sheet.jpg`: preview sheet for humans; **never use as game art**
- `README.md`: these instructions

## Quality status

The paintings are **artwork candidates**, not auto-certified seamless geometry. Their original image content is unchanged except for intentional high-quality WebP compression. The app's fixed lake tiles, route topology, and existing three master PNGs are not replaced by the package.
