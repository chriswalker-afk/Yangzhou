# Yangzhou V3 — Accepted candidate material pack

These three materials were accepted **as artwork candidates** in chat. They are not yet production-approved. The full-resolution original files were created outside GitHub and are retained without any modification in the corresponding material pack. GitHub's current connector supports code and metadata writes but not binary-image attachment transfer. This PR therefore commits the manifests, loader, test logic and a local-file preview but **must not claim the WebP images are already imported**.

## Exact binary handoff (three files)

Upload the following **unaltered lossless WebP** files into `assets/v3/materials/` on branch `feat/v3-accepted-materials-preview`:

- `grass-01-lossless.webp` — 2,271,520 bytes, SHA-256 `6f2d66fe8de1091112609c65c6cb9a563dc0f8189d85b8e5a528c6b1273f5ebb`
- `stone-01-lossless.webp` — 2,113,914 bytes, SHA-256 `ba36e366d7d2a2c712a66408ece8afcdcb02d814a8e39be37f5ca10348579f84`
- `water-01-lossless.webp` — 1,610,606 bytes, SHA-256 `abdf3356f5c47520c59a58e0a506d983c7de5e2f40e58bfbc4fe1aca70627ad9`

The files are expected to be 1254 × 1254. The original image PNGs remain the archival masters and may be stored in a separate optional source ZIP, not required in the playable preview.

The CI contract in `tests/v3-materials.cjs` verifies all three hashes and dimensions automatically **when all three images are present**. Partial uploads fail CI. Until they arrive it reports the explicit missing-binary state; the lab displays untextured geometry and a local-upload control rather than pretending the textures have been committed.

## Preview

Open `layer-lab-v3.html` on the feature-branch preview (or after merge on GitHub Pages). On page load it attempts the three committed files. If absent, select those same WebPs using the three file inputs. It draws three linked east/west streets and three linked east/west canals with the textures sampled from **global board coordinates**. Check the guide overlay and inspect 1× / 3× at neighbouring seams.

The tile system, live `index.html`, V2 artwork, and all scoring and camera mechanics remain unchanged. V3 is an isolated prototype. Only after a strong visual review should the material library be promoted to finished artwork.
