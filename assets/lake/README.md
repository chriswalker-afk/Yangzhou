# Slender West Lake painted square assets

This directory intentionally contains the **staged manifest only** until the six binary WEBP files have been copied into the repository. The painting exports are supplied in the associated conversation as **Yangzhou_Slender_West_Lake_Artwork.zip**.

The expected assets are:
- 01-willow-garden.webp
- 02-northern-lake.webp
- 03-lakeside-teahouse.webp
- 04-white-pagoda.webp
- 05-five-pavilion-bridge.webp
- 06-breakfast-house.webp

All are individually exported, exactly aligned 512×512 square images. Their shared seams contain **no blur, artificial edge wash, black tile border or embedded actors**. The zip also contains the uncropped 3:2 master and a **review-only grid/port image**; those must not be loaded as playable tiles.

To install the six assets once the ZIP is available on your computer, run:

```bash
python scripts/install_lake_art.py Yangzhou_Slender_West_Lake_Artwork.zip
```

This runs pixel QA and **keeps the manifest `staged` even if automated checks pass**. A staged or incomplete asset set leaves the current independent orthographic fallback working. Only set `approved` after the visual and historical reviews are complete; never bypass failed geometry tests.

**Art direction:** true top-down, no horizon or camera tilt; recognisable Five-Pavilion Bridge, White Pagoda, teahouse and breakfast-house courtyards; generous quiet water and planted shores. A naturally wide fixed lake may span internal scenic seams, while road endpoints and all **exterior** water/road ports must remain exact.
