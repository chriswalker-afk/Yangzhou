# One-upload Yangzhou art import

This branch prepares an automated import of the user's **one ZIP package**.

## How to upload

1. Download **yangzhou-art-variants-v1.zip** from the ChatGPT conversation.
2. Open the [direct upload page](https://github.com/chriswalker-afk/Yangzhou/upload/feat/yangzhou-art-pack-import/incoming).
3. Select the ZIP **without unzipping it**. Commit to **feat/yangzhou-art-pack-import**.
4. GitHub Actions checks the ZIP hash and all nineteen image hashes, safely extracts the paintings and adds the seeded runtime variation loader. The original ZIP is removed from the branch after successful extraction to avoid storing two copies.
5. Review this PR's checks and the 19-image [art gallery](../variant-gallery.html) after import, then merge.

The pipeline cannot approve painterly seams or verify historical accuracy; source topology signatures remain authoritative. No picture is rotated, and one tile's scenery is stable while zooming/panning. The existing three original master PNGs and six fixed Slender West Lake paintings are preserved.

If the import workflow fails because GitHub Actions lacks write access to the branch, inspect the Action run. The matching exact-hash script can also be run manually on a Git checkout: `python3 scripts/import_yangzhou_art_pack.py`.

GitHub's browser limit is **25 MiB per file**; this package is about **18.9 MiB**.
