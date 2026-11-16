# Yangzhou V3 — Layer 2 artwork certification and next-asset roadmap

**Certificate:** `assets/v3/layer2-art-certification.json`  
**Review recorded:** 16 November 2026  
**Scope:** visually approved original paintings + integrity + geometry-safe V3 preview, not V2 launch  
**Evidence:** `tests/v3-layer2-art-certification.cjs`, prior V3 Layer 2 / moon-gate / continuous-wall tests, and the linked in-repository previews.

## 1. What is certified

The game now has **eight certified large-detail original artworks**:

| Asset | World footprint | V3 art certificate and placement |
|---|---|---|
| Courtyard Hall 01 | 96×47 | South-facing reference hall; valid approved arrangement in enclosed courts |
| Willow Tree 01 | 48×58 | Approved foliage; trunk (7-unit radius) must remain on land, canopy may overhang |
| Garden Rockery 01 | 52×37 | Approved solid garden ornament |
| Garden Pavilion 01 | 52×52 | Approved open garden structure, compass-upright |
| Bamboo Grove 01 | 62×45 | Approved garden planting, solid ground footprint |
| Garden Rockery 02 | 60×41 | Approved second rockery/flower arrangement |
| Courtyard Wing 01 | 33×87 | Approved **north–south** side wing; use wider compound, not the original narrow court |
| Waterside Landing 01 | 95×47 | Approved painted shoreline **only on the north bank of a straight east–west 88-unit canal**; other orientations require new artwork |

Also visually certified **the active moon-gate artwork** and **the continuous-wall roof-tile, ivory plaster and stone-base paintings** (four more source art files, for **12 verified binaries** in total). The real 30-unit moon-gate aperture, 12-unit gate-to-hall walkway, camera-consistent corner geometry, actual ground viewed through the portal and water/road exclusion rules are part of the accepted composition contract. The old independent long/short/corner wall-sprite assembly system is **archived reference, not certified as the active wall architecture**.

Every certified binary is referenced by exact SHA-256 and size in the machine-readable certificate. Original artwork bytes were **not re-encoded, changed or replaced** in this certification pass. Their source availability is recorded: original PNG masters for the older willow and Rockery 01 are still not in the repository, though their lossless WebP gameplay assets are.

### Distinct approval levels

**V3 artwork certified:** Current ink-and-watercolour look, elevated camera, local scale, original transparent sources, known geometry-specific use and visual appearance in available previews have been reviewed and accepted.

**Not yet certified:**
- Historical identification and precise dating for all motifs and landmark structures.
- Pattern repetition, density and scene variation over **12–25+ connected tiles**, rather than the existing six-tile samples.
- New orientations, collisions and overlays that are *not* already validated; especially canal landing on a **south, east or west bank**, and any new side-wall moon gate.
- Final playable V2 / subsequent V3 game migration, player placement, scoring and rendering performance.

Therefore `productionApproved:false` remains **intentional**. `artworkCertifiedForV3:true` now means the drawings themselves do not need to be repainted to proceed to composition work. This avoids marking a prototype as a tested release or falsely claiming independent historical approval.

## 2. What is actually missing

The current eight sprites cover **domestic courtyard + private garden + one canal landing** extremely well. The missing area is *not* additional versions of the same rockery. It is the distinction between different **urban tile identities**: street, commercial bank, actual bridge, secondary courtyard and special lakeside landmark.

Historically grounded direction: Yangzhou's 18th-century salt-merchant gardens connected riverside villas, rockwork, vegetation, halls and corridors, while shopping and social facilities were part of the wider canal-and-garden landscape. The UNESCO World Heritage Centre's Slender West Lake description emphasises the connected mid-18th-century merchant garden scenery; historical landscape-architecture research also identifies garden corridors, stone bridges, water-adjacent buildings and front-commercial/rear-garden layouts. These references support **asset categories**, not exact approvals of any specific generated building.
- UNESCO: https://whc.unesco.org/en/tentativelists/5327/
- Garden design study: https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002513741
- Architectural and spatial chronology study: https://www.tandfonline.com/doi/abs/10.1080/13467581.2023.2300391

### New asset production list

| Order | New asset | Why it matters | Composition contract |
|---:|---|---|---|
| **1** | **Stone Bridge Parapets 01** | Currently roads crossing waterways have geometry but lack a visually distinctive bridge structure | Layer 2 rail/parapet on top of the existing Layer 1 bridge deck; keep **44-unit road** and **88-unit canal** mouths, no new core artwork |
| **2** | **Street Shopfront 01** | Without street-front architecture, connected road tiles look like empty garden land | One south-facing compact shop with eaves, timber shutters and walkway-facing entry; no building into road core |
| **3** | **Covered Garden Corridor 01** | Adds intentional links between a hall, side wing and pavilion; breaks up single-building courtyards | Footprint follows planned walkable corridor, does not block gate or cross roof coping; geometry-owned connection endpoints |
| **4** | **Waterside Pavilion 01** | Creates a true waterside scene without repeating the landing garden | Separate south-facing pavilion on the north bank, with shadow on land and no water-mask modification |
| **5** | **Small Residence 01** | Fills medium/smaller courtyard layouts and reduces mandatory Hall 01 repetition | A distinct smaller roof and building, compass upright, west/east footprint options need authored positions |
| **6** | **Tea House 01** | A more recognizable commercial destination for road/canal-adjacent tiles | Larger but still tile-owned, road-front orientation and optional canal view; not a landmark yet |
| **7** | **Side-Facing Moon Gate 01** | Current painted portal is suitable for horizontal walls; side-wall apertures cannot use a naïvely rotated sprite | Commission a genuinely new camera-consistent gateway view for north–south walls, with separate exact opening mask |
| **8** | **South-Bank Landing 01** | Current approved landing works only on the north side | A separate painted orientation, geometry `L/W/L/W`, southern bank; do not rotate the accepted 01 painting |
| **9** | **Plum Blossom Tree 01** | Distinctive garden colour/seasonal silhouette without adding another large building | Land-only trunk, translucent canopy, ensure normal zoom legibility |
| **10** | **Courtyard Entrance Step 01** | Makes the hall-to-path join believable and readable | Small architecture above Layer 1B paving; doorway collision and ground connection remain open |

### Later, not immediate

A historical **White Pagoda**, **Five-Pavilion Bridge**, larger **stone boat** or multi-building market composition could strongly define Yangzhou. However, these deserve **multi-tile landmark contracts**, period-specific historical verification (especially the date within the 18th century), and custom camera/scale proof. They should **not** be squeezed into an ordinary 220×220 tile or generated as generic garden props.

## 3. Next build sequence / acceptance

**Pass A — tile-grammar variation (no new art):** Make a **4×4 and 5×5** connected test board mixing all-land, streets, simple canals, bridges and bends. Add a meaningful variety checker: no identical hall+wing layout repeated within immediate neighbours, at least three types of garden composition, and open/empty spaces kept deliberately. Restore the original willow/rockery to some integrated compositions; the current rev49 example focuses on the five newer assets.

**Pass B — Bridge Parapets 01:** Paint exactly one original transparent artwork that matches the fixed camera and the actual road-over-water bridge connector. Integrate as a **geometry-based overlay**, not a whole-tile image. Test 1×/3×, perpendicular viewpoints, tile seams and no route blockers. Check the visual bridge is plausibly spanning the existing water and doesn't widen canal/road masks.

**Pass C — Shopfront 01, then Covered Corridor 01:** These unlock visually different urban and garden areas. Each should have its own art preview and rules before mixing into multi-tile layouts.

**Pass D — remaining assets by demonstrated need:** Waterside pavilion, smaller residence, side-moon-gate and opposite landing **only if the tile grammar actually uses them**; never add assets for which no valid placement exists.

Acceptance for any new asset: preserve PNG master if available; produce independent transparency-backed lossless WebP with documented SHA-256, world footprint and orientation; render genuine artwork at 1× and 3× next to existing buildings/walls/water; test all allowed edge signatures, collisions, normal/magnified/mobile and repeated layouts; certify visual artwork separately from historical and production milestones.

## Canonical prompt for every new sprite

All newly commissioned Layer 2 artwork should start with [the reusable V3 asset prompt](V3-CANONICAL-ASSET-GENERATION-PROMPT.md). The fixed camera/material/transparency paragraphs remain unchanged; fill only the object, compass orientation, world footprint and allowed geometric placement. Attach **real certified source artwork** with each request. This prevents perspective/style drift and forbids painting full scene backgrounds into independent sprites.

## 4. Rules to retain

- Original **220×220** tile coordinates; connect only with exact **44-unit street** or **88-unit canal** mouths.
- All original paintings **compass-upright**; never simply rotate a roof, moon gate, portal or landing to manufacture a missing orientation.
- Keep **Layer 1A geography**, **Layer 1B textures** and **Layer 2 architectural sprites** independent.
- No fences, wings or trees may block true walk-through moon gates, the courtyard's own path, bridge routes or bank safety margins.
- Do not let the decorative shoreline overlays intrude into another joining canal arm.
- Prefer clear district identities to densely filling every tile: enclosed residence, quiet garden, canal-side, street-market and eventual landmark.
- V3 is still a prototype; pass a whole-board performance/readability test before any change to playable V2.
