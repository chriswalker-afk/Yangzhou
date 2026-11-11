# Yangzhou V3 — Accepted candidate material pack

The three user-accepted **candidate** textures are committed in this directory, byte-for-byte, as original lossless WebPs. They are **not** production-approved, visually seam-approved, or historically approved. The first three source PNG paintings are provenance references; the playable laboratory loads the committed WebPs directly.

## Committed files and exact integrity contract

| Material | Filename | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| Jiangnan garden grass | `grass-01-lossless.webp` | 2,271,520 | `6f2d66fe8de1091112609c65c6cb9a563dc0f8189d85b8e5a528c6b1273f5ebb` |
| Mossy stone paving | `stone-01-lossless.webp` | 2,113,914 | `ba36e366d7d2a2c712a66408ece8afcdcb02d814a8e39be37f5ca10348579f84` |
| Muted jade canal water | `water-01-lossless.webp` | 1,610,606 | `abdf3356f5c47520c59a58e0a506d983c7de5e2f40e58bfbc4fe1aca70627ad9` |

All three textures are **1254 × 1254 pixels**, RIFF/WebP VP8L (lossless) images. `manifest.json` is the machine-readable source of truth for their exact filenames, byte counts, image dimensions, SHA-256 checksums, material periods and candidate-only approval state.

The `node tests/v3-materials.cjs` test **requires all three files**, verifies their exact bytes/checksums, lossless image signature and dimensions, and checks their runtime/manifest links. Missing or substituted files fail CI; there is no zero-file or partial-file success case. These automated checks establish integrity and geometry, **not** visual seamlessness or artistic acceptance.

## Preview and next gate

After merging PR #20, open [the six-tile V3 material laboratory](../../layer-lab-v3.html) on GitHub Pages or from a local static HTTP server. All three images should load automatically and the status must say `All three texture candidates loaded` with `loaded from GitHub assets` for each. The three optional file inputs only compare alternate images in the browser; they do **not** upload replacements.

Inspect the connected 3 × 2 scene at 1× and 3×, toggle exact mouth guides, and inspect the bend test. Check for obvious repeats, colour mismatch, seams and unnatural boundaries before any production promotion. If a texture needs editing, keep it as a **new** identified candidate rather than overwriting a verified original.

The current live `index.html` game, V2 art, board logic, scoring and camera remain unchanged. Layer 2 transparent assets (a courtyard/wall, willow and rocks) begin **after** this visual review.
