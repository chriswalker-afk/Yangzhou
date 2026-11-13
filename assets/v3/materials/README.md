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

## Layer 1B: Courtyard Paving Texture 01 — rev 44

The separate **courtyard ground-surface** candidate is stored here as
`courtyard-paving-01.webp` (original generated Jiangnan ink-and-watercolour stone/grey-brick paving, prepared as high-quality WebP).

| Provenance | Value |
| --- | --- |
| Original ChatGPT-generated PNG | `jiangnan_courtyard_stonework.png`, 1254×1254 |
| Original PNG SHA-256 | `5eca68db68132e8f1350da2ac40f1546b37b37bcaa0c80cf623e736e5551f74e` |
| Committed optimized WebP | `courtyard-paving-01.webp`, 1254×1254, **682,158 bytes**, quality 95 |
| WebP SHA-256 | `fc7f03b7f047295ac0e1de8d7872d5f143874bc506c4b9d9bbd39a324da4a083` |
| Git object SHA-1 | `cf2b70e4a59ddf58f88d54798ae54eb29b26dfca` |
| Physical world repeat | 96 × 96 V3 world units; origin-anchored in board coordinates |
| Approval | **Artwork candidate only — visual repeat seam QA pending** |

This **does not replace the original three base materials** above. It is an additional Layer 1B surface applied between the original V3 grass/road/canal geography (Layer 1A) and large structural sprites (Layer 2). The WebP is the exact high-quality derivative prepared from the generated PNG; the original source hash is recorded in the manifest for provenance. The original PNG is retained as a conversation-generated source rather than incorporated into the deployed game bundle.

The new `assets/v3/courtyard-paving.js` module verifies exact bytes, dimensions and SHA-256 before loading. A filled interior is **derived from the real closed-rectangle wall centreline** (reference footprint x=42..178, y=47..178), clips to the courtyard polygon and uses a world-aligned repeat phase. Open L/T/three-sided walls and route-invalid tiles are not paved until their ground boundaries are explicitly designed. The hall and painted walls always draw **above** the surface. Moon-gate gaps and the canonical 44-unit street/88-unit canal ports remain unchanged.

Review the [rev 44 courtyard paving and continuous wall lab](../../wall-geometry-lab-v3.html?rev=44): switch **Show Layer 1B courtyard paving** on/off, compare the paved compound against grass and study the **2×2 original-painting repeat proof**. At both 1× and 3×, check the horizontal and vertical repeat joins and paving scale beside the courtyard hall. Automated integrity and geometry checks do **not** certify artistic seamlessness; if there is a visible seam, create a new derivative candidate rather than silently changing this verified file.

Playable V2 and previous V3 Layer 1A/Layer 2 labs are unchanged.
