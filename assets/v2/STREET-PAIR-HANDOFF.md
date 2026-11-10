# Street-pair artwork handoff (original PNGs)

The two original 1254 × 1254 PNG files have been produced, verified, and assigned to `street-straight` in the correct **east–west (LSLS)** geometry. They are **not in GitHub until the two actual binary files are added**; status is tracked honestly in `assets/v2/street-pair-intake.json`. The live `assets/v2/manifest.json` has not been replaced, so gameplay on main continues using the existing original.

## File upload — exact names (on this PR's branch)

Select branch **`feat/painterly-street-pair-v2`** in the GitHub web UI, open `assets/v2/`, and upload exactly these **original binary PNG** files (not 200px thumbnails or cropped image copies):

- `street-east-west-repaint.png` — 1254 × 1254, 3,804,335 bytes, SHA-256 `6154a21f963d9d3d42253d2067faec3ff0f9f12b216515d0f90dbdb4c868036e`.
- `street-east-west-neighbour.png` — 1254 × 1254, 4,034,740 bytes, SHA-256 `3ea085876ce7941525314b6a846989311bb5562bbfc14dc8098cda0fcbf49df3`.

The prior original `street-straight-east-west.png` (4,108,283 bytes) must **remain**; never overwrite or delete it.

Once the files exist, `node scripts/validate_street_pair.cjs` checks exact byte hashes, PNG header, square dimensions, and two *different* originals. The [street pair review](../../street-pair-review.html) then loads the actual two PNGs from GitHub without a local picker, side by side at 1×, 2× or 3×. It can show gold port guides and swap the left/right order.

After those checks pass, update **only** the `street-straight` variants:

| Variant | Edges | Image | Proposed stage |
|---|---|---|---|
| 1 (90°), east–west | `LSLS` | `street-east-west-repaint.png` | `review` |
| 3 (270°), east–west | `LSLS` | `street-east-west-neighbour.png` | `review` |

**Do not rotate any painting 90°/270° in canvas.** Rotations here refer to the connection contract, not rotated buildings. The other 30 variants remain composition studies. Never mark a painting approved until the physical painted road mouths meet the exact 44/220 geometry and the seam between two genuinely distinct originals looks continuous at overview and 3× zoom. The user has expressly chosen a high artwork-quality standard, not an automated geometry-only solution.

The first image is intended as a fresh *repainting* of the original scene, while the second is a different garden architecture composition; they are not a cropped panorama or duplicates. The two PNGs **have not** been accepted as seamless yet. Human review and historical sign-off remain separate.
