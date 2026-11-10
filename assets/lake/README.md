# Slender West Lake painted square assets

This directory now contains the **six original binary WEBP files** and a staging manifest. The art was imported through GitHub's binary blob API with each Git object SHA checked against its local source. The source package is also available as **Yangzhou_Slender_West_Lake_Artwork.zip** in the associated conversation.

The expected assets are:
- 01-willow-garden.webp
- 02-northern-lake.webp
- 03-lakeside-teahouse.webp
- 04-white-pagoda.webp
- 05-five-pavilion-bridge.webp
- 06-breakfast-house.webp

All are individually exported, exactly aligned 512×512 square images. Their shared seams contain **no blur, artificial edge wash, black tile border or embedded actors**. The zip also contains the uncropped 3:2 master and a **review-only grid/port image**; those must not be loaded as playable tiles.

To reinstall or replace these assets with a new ZIP on a local checkout, run:

```bash
python scripts/install_lake_art.py Yangzhou_Slender_West_Lake_Artwork.zip
```

This runs pixel QA and **keeps the manifest `staged` even if automated checks pass**. A staged or incomplete asset set leaves the current independent orthographic fallback working. Only set `approved` after the visual and historical reviews are complete; never bypass failed geometry tests.

**Art direction:** true top-down, no horizon or camera tilt; recognisable Five-Pavilion Bridge, White Pagoda, teahouse and breakfast-house courtyards; generous quiet water and planted shores. A naturally wide fixed lake may span internal scenic seams, while road endpoints and all **exterior** water/road ports must remain exact.


### Review preview without approving production artwork

Open the website with `?lakeArt=preview` appended to its URL to load these six staged paintings. Without that query parameter, the existing orthographic map remains the public default until the geometry and visual checks are approved. The preview mode deliberately does **not** change `manifest.json` or scoring rules.
