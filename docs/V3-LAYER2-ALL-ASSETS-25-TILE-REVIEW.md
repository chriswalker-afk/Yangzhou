# Yangzhou V3 — All Layer 2 Asset Review (18 unique sprites / 25 tiles)

**Scope:** 5×5 connected preview, original PNG/WebP intake for Plum Blossom Tree 01, Courtyard Entrance Step 01 and South-Bank Landing 01. **Review-only; not a production release.**

## Asset counts and provenance

- **8 previously artwork-certified:** Courtyard Hall 01; Willow Tree 01; Garden Rockery 01; Garden Pavilion 01; Bamboo Grove 01; Garden Rockery 02; Courtyard Wing 01; Waterside Landing 01. Source: `assets/v3/layer2-art-certification.json`. Keep existing certificates unchanged.
- **7 existing new candidates:** exact 88×44 water-backed bridge, Street Shopfront, Covered Garden Corridor, Waterside Pavilion, Small Residence, Tea House and simplified Waterside Landing 02. Source: `assets/v3/large/seven-candidates-manifest.json`. None is automatically approved.
- **3 newly painted candidates:** Plum Blossom Tree 01, Courtyard Entrance Step 01 and South-Bank Landing 01. Original PNG masters and **lossless, pixel-identical (including transparent RGB) WebPs** are stored under `assets/v3/large/` and `assets/v3/large/sources/`. Source: `assets/v3/large/three-latest-candidates-manifest.json`.

The retired independent side-facing moon-gate bitmap is **not** placed. The genuine horizontal moon gate, camera-consistent continuous courtyard walls, walkway and paving, grass, stone, water, painted canal banks and path verges remain separate layers.

## New placement contracts

| Asset | Footprint | Source drawing aspect | Authored placement |
| --- | --- | --- | --- |
| Plum Blossom Tree 01 | 48×58 | Draw at 48×48 with 5 units of transparent top/bottom room; trunk approximately 6-unit radius, 21 units below anchor | Solid ground trunk, lighter canopy may visually overhang; first review on all-land |
| Courtyard Entrance Step 01 | 20×10 | Draw at 20×6.67 (no 3:1 → 2:1 stretch) | x=110,y=137 immediately below Hall 01 south facade (bottom y=132.5), on an unchanged **12-unit walkable courtyard walkway** |
| South-Bank Landing 01 | 95×47 | Draw at 94×47 (native 2:1 aspect), centred within 95×47 envelope | x=110,y=183.5, land y=160..207, south of immutable 88-unit wide east–west canal (water y=66..154), LWLW orientation |

For comparison, the already-certified north-bank original Landing 01 and newer simplified Landing 02 both appear on separate straight horizontal canal tiles. Neither is mirrored or rotated to fabricate the south-bank landing.

## Test and visual review

[Open the all-18, 25-tile connected review page](../layer2-all-assets-v3.html). It includes toggles for certified/new/latest/walls, 1×–3× zoom, source-verified independent asset gallery, highlighted placement, tile inspection and enlarged in-context close-ups of the three latest candidates plus the bridge.

- Logic: `node tests/v3-all-layer2-review.cjs` verifies all **18 binary WebP files**, 3 original PNG masters and SHA-256, exact footprints, land/water masks, 25 topology-connected tiles and that the old gate is retired.
- Browser: `node tests/v3-all-layer2-review-visual.cjs` (Playwright) verifies the real page in desktop and mobile, all 18 images loading, the new three sprite toggles changing their painted areas, unchanged canal water and bridge with no road underlay. Publishes screenshots under GitHub Actions artifacts.
- The first sample uses deliberately uncrowded garden areas. **Visual acceptance of perspective, overhang, seasonal colour, repetition across 25 tiles, and 1×/3× readability is still needed.**

Follow-up V3 geometry-only pass: stone-paved streets are now 40 units wide (previously 44); the bridge painting remains 88 × 44 and connects through two short dry-bank tapers. The V2 tile topology/art and eight original certifications remain untouched. The connected 4×4 and 5×5 review pages now share the narrower V3 geometry. New candidate statuses remain `artworkCertifiedForV3:false` and `productionApproved:false`.
