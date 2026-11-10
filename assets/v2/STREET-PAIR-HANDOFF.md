# Street-pair artwork handoff (original PNGs)

The two original 1254 × 1254 PNG files have been produced, verified, and assigned to `street-straight` in the correct **east–west (LSLS)** geometry. They are **not in GitHub until the two actual binary files are added**; status is tracked honestly in `assets/v2/street-pair-intake.json`. The live `assets/v2/manifest.json` has not been replaced, so gameplay on main continues using the existing original.

## Integration completed — original source files verified

Both user-uploaded originals are present at their exact full byte sizes and SHA-256 checksums. The deployed `assets/v2/manifest.json` now loads them automatically in the correct **LSLS** west/east street orientation.

| Variant | N/E/S/W | Original artwork | Current status |
| --- | --- | --- | --- |
| 1 (90°) | `LSLS` | `street-east-west-repaint.png` | `review` |
| 3 (270°) | `LSLS` | `street-east-west-neighbour.png` | `review` |

The first PNG `street-straight-east-west.png` remains as an archival reference and has not been changed. Run `node scripts/validate_street_pair.cjs` and `node tests/v2-contract.cjs` to verify exact content and pointer integrity. [Street pair review](../../street-pair-review.html) and [independent-neighbour QA](../../painted-neighbour-lab.html) now show both originals automatically.

**Do not rotate any painting 90°/270° in canvas.** Rotations here refer to the connection contract, not rotated buildings. The other 30 variants remain composition studies. Never mark a painting approved until the physical painted road mouths meet the exact 44/220 geometry and the seam between two genuinely distinct originals looks continuous at overview and 3× zoom. The user has expressly chosen a high artwork-quality standard, not an automated geometry-only solution.

The first image is intended as a fresh *repainting* of the original scene, while the second is a different garden architecture composition; they are not a cropped panorama or duplicates. The two PNGs **have not** been accepted as seamless yet. Human review and historical sign-off remain separate.
