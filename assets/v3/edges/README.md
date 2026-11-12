# Canal Bank Edge 01 — pending binary handoff

The genuine transparent Jiangnan ink-and-watercolour canal-bank painting has been generated and the V3 lab can already preview its image via the local-file picker. **The authentic binary is not yet uploaded to GitHub.** This PR is intentionally a draft and no temporary geometric styling is being misrepresented as the painting.

## Exact candidate file to upload

Use `canal-bank-edge-01.webp`, a prepared, lossless **2172 × 226 RGBA WebP** derived from the chat-generated **2172 × 724 PNG**. The image's wide transparent margins have been cropped, low-alpha noise removed, and a narrow symmetric blend applied at the horizontal seam to prepare it for repeatable use.

- Expected file path: `assets/v3/edges/canal-bank-edge-01.webp`
- File size: **632,080 bytes**
- SHA-256: `ffbb109f2c44c2ab122299b973cc0fc6358a9486beefc1a9c358cf351eb7bdf5`
- Original source PNG SHA-256: `cbef6e2ffad92e8a8171a944694ace9e498a7be97397de16f5a9bbe6fe048862`
- Original source file: `watercolour_canal_bank_tile.png`

**Do not substitute a generated SVG or a flat-colour placeholder** for this image. Upload this exact WebP to the PR branch `feat/v3-painted-canal-bank-01`. Once present, update `fileCommitted` in the manifest and change the test to **require** the file and check its SHA-256, dimensions, alpha format, and source metadata.

## Browser preview

Open the `layer-lab-v3.html` page from a static HTTP server. Without the committed image, select the real PNG or WebP locally using **Local canal-bank PNG/WebP**. The painting will be mapped to both canal banks and follows bends, with its water-side edge facing the unchanged jade canal core. Compare painted-bank **ON/OFF**. The exact 44-unit road and 88-unit canal mouths remain unchanged. The bridge deck is drawn above the canal bank.

**Not yet approved:** perspective/top-down appearance, size/scale, repeated joins, bends, junction overlap, artistic consistency and historical suitability. A passing code test alone never constitutes artwork approval.
