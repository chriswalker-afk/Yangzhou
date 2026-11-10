# Slender West Lake painted square assets

This directory contains **six individual painted WEBP squares**, with an aligned southern 88-unit water exit. The manifest is currently `review` (visible by default, not production art sign-off). The art was imported through GitHub's binary blob API with each Git object SHA checked against its local source. The source package is also available as **Yangzhou_Slender_West_Lake_Artwork.zip** in the associated conversation.

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


### Detailed paintings shown by default

The game now loads the six actual painted assets automatically. The manifest status is `review`, which makes the assets visible while clearly withholding artistic/historical production approval. `?lakeArt=preview` remains a permitted inspection alias, but is no longer needed for normal viewing.

The southern water mouth was locally corrected to exactly match the navigable 88/220-centred port; its source painting retains continuous brushwork, with no blurred collars or added grid lines. Continue checking real outer-ring tile transitions and cultural detail before setting `approved`.
