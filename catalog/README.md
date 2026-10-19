

Final owner-directed pricing method/presentation: every priced model and linked portfolio copy uses three verified recent exact-condition sales first, then at least three independent current listing sellers (30 days), then historical asks (180 days), then USD MSRP × 1.10^age. One latest observation per URL/seller; repeated polls do not inflate samples. Boxed/unopened asks share a stated group, loose stays separate, and sold condition comparisons remain exact. SQLite adds `price_listings` (17 non-FTS tables). Market value is green, MSRP blue, both USD, with TomiKing pricing branding. All methodology, sample/range/freshness and the indicative-price explanation stay behind tap-to-open controls; marketplace/manufacturer/rate links and seller identities stay in underlying research data. No user-facing estimate label.

Reviewed listing input covers the exact yellow LV-86b with three independent boxed asks at USD 155, 95 and 170 (initial mean 140). The shared hierarchy applies to all 2,934 MSRP references; listing-specific coverage is currently one reference, not the whole catalog. Scheduled refresh validates pinned title/URL/seller/condition, active stock and matching visible/structured USD asks; ended listings deactivate without inferring a sale. Three reviewed sold observations span three products, still zero supported three-sale averages. New listing identities/transactions require review; no bulk sold-discovery feed is connected.


# Tomica-family price overlay · app 0.4.13

`input/tomica-prices.json` adds 1,254 exact-title/source-matched tax-inclusive MSRPs from 82 already-cited official Takara Tomy monthly pages (2020–2026). It preserves title/price text, page hash, source row and check date; 148 unmatched citations and zero conflicts are recorded. Older or ambiguous references remain unpriced. Manual fetching and optional-JSDOM parsing are separate from deterministic builds. All app price amounts, including MSRP, display in USD using the dated rate; original JPY amounts remain internal source evidence.

`input/tlv-prices.json` records 1,680 positive manufacturer-published Japan list prices, exact product sources, source hashes, one sparse sold listing, excluded ambiguous listings and dated ECB FX evidence. Four manufacturer zero prices are excluded. MSRP is as observed, not necessarily original launch MSRP. Canonical release IDs/Japanese facts are unchanged. `scripts/import-tlv-prices.py` manually processes saved source evidence; `scripts/build-prices.mjs` validates and generates browser/native JSON/modules without network access. Sold evidence may be appended only after exact variant, condition, single item, final price, currency and date review. eBay's restricted Marketplace Insights feed is not connected; public sold search required CAPTCHA and was not bypassed.

`input/price-sales-review.json` adds two reviewed exact-variant USD eBay observations and records rejected Mercari, Catawiki and other eBay candidates. Original UTC dates, page hashes and review notes are retained; no sold-count multiplication. Total three observations across different releases still yields zero supported comparable-sale averages. MSRP controls are blue; value controls remain green in both themes.


Public pricing refresh runs on a separate GitHub Actions schedule targeting every 48 hours (elapsed-time gating across month boundaries; scheduler delays are possible). It refreshes dated ECB USD conversion and exact known manufacturer evidence; changed/ambiguous Tomica pages retain prior evidence pending review. It does not infer new sales from retail stock or sold counters. The app checks the published snapshot every 48 hours while online/on resume, persists its last successful check, and backs off six hours after failure. Manual Sync price data remains available. New independent sold observations still require verifiable variant, condition, final price and exact date; no bulk eBay/Mercari feed is connected. Private collections never leave the device. Price-only snapshot refreshes redeploy Pages without repackaging installers; installed apps download the new overlay.

Require at least 3 distinct confirmed USD observations per exact variant/condition over 180 days, excluding shipping/tax, hidden Best Offers and retail asks. Remove 1.5-IQR outliers with at least 5 observations. Otherwise the owner's rule is MSRP in JPY × (ECB USD/EUR ÷ JPY/EUR) × 1.10^(current UTC year − catalog release year), floored at zero years. Clearly label formula estimates; no condition adjustment or guaranteed appreciation is claimed. Keep dated conversion and method details visible on tap; source links remain internal and unknown MSRP unavailable. `pricing-core.js` supplies shared validation/calculation; tests use synthetic transactions only as fixtures, never published sales.

Price sync fetches only the official Pages JSON, rejects invalid/older/oversized/redirected data, and persists public cache before activating it. Manual per-copy fallback and paid values are not rewritten. SQLite adds release_msrp, price_sales and pricing_metadata alongside existing tables.

# English and image presentation · app 0.4.10

All 4,268 current Tomica-family release references have editorial English display names, colors and series. The original Japanese catalog facts and IDs remain unchanged and searchable. These are collector-facing translations, not official manufacturer translations. `input/tomica-english-glossary.json` and `input/tomica-english.json` are reviewed inputs; `input/tomica-translation-review.json` must be empty for publication. A display overlay avoids rewriting existing private collections.

The active selection now contains **2,450 photo entries**: 441 Tomica, 1,559 Limited Vintage-family and 450 Matchbox references. The first four batches contain 500 Tomica-family entries each; the fifth adds 200 Matchbox releases from 2025 and the sixth adds 250 from 2023–2025. Matchbox uses BAMCA's larger 600×360 variant photographs rather than the 200×120 source thumbnails, with a pixel comparison against the cited variant image and a full visual review. `input/catalog-image-overrides.json` records only these reviewed higher-resolution URLs; the original research queue and product citations remain intact. Source rights and photographer credits remain with BAMCA and its contributors, linked per release. `input/catalog-image-batches/` preserves every reviewed batch, including the byte-identical first manifest. `input/catalog-image-batch.json` records the cumulative selection and image verification; `input/catalog-images.json` retains **15,519 source-linked candidates** for later batches. Source rows/official product IDs or matching product captions establish the reference. A source photo can still show a different decoration, package or angle; casting references are explicitly labeled. Missing images have a readable placeholder. Every active photo has an attribution link. Wiki text licensing does not establish image rights. Original image rights remain with their owners; no bulk reuse license is asserted and image bytes are not bundled.

Images load online from source hosts, retain their available resolution, and use uncropped 4:3 framing. Photos in an installed app are not guaranteed offline. Private photos always override catalog references. The public SQLite export includes separate English and active-image tables and indexes English/Japanese text without changing canonical release facts.

Run `python3 scripts/prepare-catalog-image-batch.py --batch-id YYYY-MM-DD-NNN --brand tomica-family --size 500` (or `--brand matchbox --size 250`) manually only for an authorized next batch (existing IDs are excluded, successful verification is reused and known placeholder hashes are rejected), then `npm run catalog:build`, `npm run check` and `npm test`. Fetching/translation never runs during ordinary builds or startup. The following sections retain historical catalog provenance and limitations.

# TomiTrack public release catalog

Snapshot `2026.10.16.3` contains **17,920 public references**, **6,807 casting entities**, and **2,311 yearly series**. Hot Wheels: 10,698; Matchbox: 2,954; Tomica: 2,584; Tomica Limited Vintage family: 1,684. All coverage is partial; entity counts are conservative reference links, not an authoritative count of tooling. No private collector data appears here.

## Tomica history and provenance

Tomica records span 1970–2026. Historical numbered editions and selected Foreign, Premium, Dream and international references are attributed to the CarLove collector-maintained number/edition list. These are explicitly collector references, not manufacturer verification. Official Takara Tomy monthly pages supply 2020–2026 announcements, including retailer exclusives, character releases, gift sets and separately categorized playsets. Official TOMYTEC product records supply Limited Vintage, Neo, 43 and related special families from 2004 onward. Every row retains source references; `input/tomica-sources.json` retains refreshed retrieval hashes. The reviewed normalized Tomica inputs were recovered from the hash-verified catalog blob after the interrupted workspace expired. No source images, prices or descriptive prose are copied. Original source content retains its owners’ rights; no Creative Commons license is asserted for these Japanese sources.

Names are retained in Japanese with NFKC width/punctuation normalization. `input/tomica-search-aliases.json` is an editorial search lexicon, not official translations. Exact colors are populated only for recognizable published parenthesized colors. Dates are toy release dates, never the vehicle model year. Official JAN-13 values are taken from the product catalog’s `jancode` identifiers, check-digit validated, and linked to the corresponding official product. There are 1,677 such JAN links, five existing Mattel release UPCs, and two shared assortment codes. Confirm packaging variants before saving. Listed scale is copied only when explicitly supplied by TOMYTEC.

All 13,652 recovered Hot Wheels/Matchbox records, IDs and metadata are protected by a full-subset hash test. Established ASCII identity normalization is frozen independently from the new Unicode search normalization. Tomica casting links use historical series/edition identities or official family/code links. Different source spellings and uncertain cross-family identities remain separate. Official matched historical editions merge references; uncertain duplicates are deliberately not merged. No private stored copy is rewritten when the public catalog changes.

## Explicit research gaps

`input/tomica-fetch-report.json` retains **283 undated products**, including Tomica Limited references; these are not assigned invented years or imported as dated releases. **72 official monthly URLs for 2014–2019 return 404**; their absence does not prove no products existed. **88 future or date-uncertain listings** are withheld. If only a month is provided, that month must have fully elapsed by the 2026-10-16 cutoff, preventing unconfirmed October products from appearing as released. Collector-only current-year rows require dated manufacturer corroboration. Manufacturer catalog/announcement facts still do not prove retail availability.

Next research: recover dated Tomica Limited (2001–2013) evidence, review image-based official historical archives, expand 1970–2019 variants and commemoratives, reconcile collector/manufacturer name differences, and verify barcode/package assignments. Family/annual counts describe imported evidence only. No range is marked complete.

Run `npm run catalog:fetch:tomica` manually to refresh the 84 public evidence snapshots. The fetcher uses at most three concurrent requests and fails on network/parser errors before replacing its output. It refreshes evidence only; reviewed normalized identities are never overwritten. Add/correct facts in `input/tomica.json` after reviewing new evidence; it contains the source-tagged normalized releases, castings, series and JAN links recovered from catalog blob 7ac10c4dcd46af7362847bee5d891983518d06d9. It does not run during startup or CI builds. `scripts/build-tomica.mjs` adds reviewed input facts to the established catalog, `npm run catalog:build` regenerates web/JSON/SQLite projections, and `npm test` checks multilingual search, identifiers, data preservation and SQLite. SQLite now has additive aliases/release_date/scale columns and alias full-text search; this downloadable public catalog is independent of private IndexedDB collection storage.

Sources:

- https://www.takaratomy.co.jp/products/tomica/new/
- https://minicar.tomytec.co.jp/product/
- https://sakuyaminicarjp.crayonsite.com/p/2/

## Existing Hot Wheels and Matchbox catalog documentation


This is a growing, interconnected reference catalog for Hot Wheels and Matchbox releases from 2009 onward. Snapshot `2026.10.16.2` contains **13,652 release records**, **3,296 casting records** and **2,044 yearly series records**. There are 10,698 Hot Wheels records and 2,954 Matchbox records, with entries in every year from 2009 through 2026. These are imported reference counts, not a complete production census.

## 2009–2013 extension · app 0.3.1

Added 3,487 release references: 2,428 Hot Wheels and 1,059 Matchbox. The 10,165 previously published release records and their IDs remain byte-for-byte equivalent after JSON serialization; saved collection links need no migration. Established casting names stay first in import order. Historical aliases and MAN links connect older releases to later ones.

| Year | Hot Wheels added | Matchbox added |
| --- | ---: | ---: |
| 2009 | 392 | 258 |
| 2010 | 483 | 234 |
| 2011 | 459 | 226 |
| 2012 | 502 | 210 |
| 2013 | 592 | 131 |

The same pinned Hot Wheels snapshots supply 2009–2013 release facts; 1,650 older series-position input references were reviewed through the existing year/SKU agreement rule. No 2013 position group met that rule, so those positions remain unrecorded. BAMCA's ten historical US/International annual pages provide Matchbox names, MANs, regional numbers and variant facts. Older themed headers are retained as mainline series (for example, Heritage Classics and Emergency Response), rather than treating every row as the first theme in its table. Regional numbering or series references may produce separate rows for the same casting and decoration. These are reference counts, not unique manufacturing variants. Multipack contents and other ranges are still incomplete; this extension adds no release-specific UPC evidence.

## Relationships

Brands → castings → releases; brands/year/category → series → releases; sources → release citations; identifiers ↔ releases. Assortment barcodes are a separate relationship to a brand and category, never fabricated as unique release identifiers. Matchbox MAN IDs link known castings across years. Hot Wheels casting names are conservatively normalized; aliases preserve source naming. The 93 imported 2026 Matchbox positions currently have provisional casting records because their MAN numbers are not supplied by the source.

A release's identity is independent of a collector's owned copy. Collection records keep `catalogReleaseId`, `catalogCastingId`, release year, product code, collector number, series position, MAN number and optional UPC alongside the collector's own condition, photo, quantity, prices and notes. Saving edits and backups preserves those links. Existing v1 backups remain compatible. Snapshot values stay with the owned item even if a future catalog changes. When correcting an established identity in future, retain an alias/migration mapping instead of silently reassigning existing IDs.

## Search and categories

The installed apps load the public snapshot offline. Pages loads the same data and caches it for offline use once the service worker finishes. Names, aliases, brand, release year, series names, series positions, collector numbers, toy/product codes, MAN numbers and known UPC/EAN codes are searchable. Filters cover brand, year, category, series and ownership. Results are paginated to keep phones responsive. Categories currently include Mainline, Premium, Silver Series, Themed, Moving Parts, Collectors and Promotional.

UPC/EAN/GTIN lookups validate check digits and normalize equivalent leading-zero representations to GTIN-14. Five retailer-linked UPCs identify specifically cited 2020 Fast & Furious releases. Two common basic-car assortment codes return a range of candidates with an explicit shared-barcode notice. This is not comprehensive barcode coverage, optical barcode scanning or unique identification of every package. Unlinked codes can be kept on a collector's own record. Queries never leave the device.

## Coverage and limits

`import-report.json` records counts by brand/year, duplicate references merged and rejected input. Every imported year is explicitly `partial`. Some Hot Wheels colors, yearly series positions, packaging regions, card variants, castings/retools, retailer exclusives, multipacks and special editions are absent. Matchbox currently covers basic lineups, selected Moving Parts/Collectors/promotional records and 93 listed 2026 basic positions; additional ranges and casting links remain to be reviewed. Blank fields mean unknown. The catalog does not infer scale from a brand, generate UPCs, invent current values or treat advance listings as proof an item reached retail.

The source snapshot has known quality limitations. One malformed Hot Wheels row (`name: None`, product field containing a casting name) was rejected. 2,110 duplicate references were merged. Cross-source series-position enrichment is restricted to older row groups with at least 75% agreement by SKU with one known annual list, then requires an exact year/SKU match for each field. A repeated older 2020 group is deduplicated. Imported facts are references for the collector to check against packaging, not manufacturer verification.

## Files and build

- `input/`: trimmed factual inputs, curated barcode evidence and source hashes. No source photos or article descriptions.
- `catalog.json`: normalized public relational projection.
- `../web/app/catalog/data.js`: identical generated projection for browser, sandboxed Electron and Android WebView modules.
- `../web/app/catalog.js`: pure catalog indexing/search and GTIN validation.
- `../web/app/catalog-ui.js`: release browsing, linked details, coverage and collection-entry controls.
- `../scripts/build-catalog-db.py`: creates `artifacts/TomiTrack-catalog.sqlite` with foreign keys, indexes, FTS5, citations and coverage.

Run `npm run catalog:build` after a reviewed input change. Run `npm test` and `npm run check`. The release workflow publishes the SQLite catalog alongside the APK and EXE and includes it in SHA256SUMS. SQLite is a public catalog only, with no collector/account data.

For a manual source refresh, install `python3 -m pip install -r catalog/requirements.txt`, then run `npm run catalog:fetch`. The pinned Hot Wheels source revisions are intentional; update them only after review. Network fetching is excluded from app startup, tests and normal release builds. The fetcher uses cached responses, a maximum of three concurrent requests and checks the year/title. Inspect the input diff and attribution, bump the catalog snapshot version, rebuild, review counts and then publish. It never publishes automatically. Source availability and formats can change; failed or empty fetches must be resolved before replacing the published snapshot.

The current shared catalog is versioned with the application. Live cloud catalog moderation and independent catalog updates are future work; no database provider was activated by this change.

## Sources, attribution and reuse

Hot Wheels factual rows originate in Hot Wheels Wiki contributor tables, accessed through the rkpacheco/hotwheels-database snapshot at commit `04f57210dcba971bd9bdd8a5364493b9214c7b9c` (July 15, 2026). Series positions originate in the pvwnthem/Hotwheels-Data snapshot at `f8129cca1b34ad33a893d93ecfb0e5c0297eefe5` (December 25, 2022). Fandom's text license is Creative Commons Attribution-ShareAlike 3.0; the adapted Wiki-derived portion is distributed under those terms. Attribute Hot Wheels Wiki contributors and the cited snapshots, link the source/license and identify normalization and linking changes. Do not infer image rights from the text license. No source photos or article prose are bundled. Source array positions refer to the original pinned array.

- Hot Wheels Wiki: https://hotwheels.fandom.com/
- Snapshot: https://github.com/rkpacheco/hotwheels-database/tree/04f57210dcba971bd9bdd8a5364493b9214c7b9c
- Series positions: https://github.com/pvwnthem/Hotwheels-Data/tree/f8129cca1b34ad33a893d93ecfb0e5c0297eefe5
- Fandom licensing: https://www.fandom.com/licensing
- CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/

Matchbox factual lineup identities, MAN numbers, variant facts and regional references are credited to BAMCA and its contributors, including Dean Dierschow, Charlie Mack, David Tilley, Christian Falkensteiner, John Nijhuis, Marcel Colijn and Scott Mace. Public HTML lineup references were used because the provided JSON export omits or mismatches some mainline sections. Site photos, design and editorial prose are excluded. This does not assert that BAMCA grants a Creative Commons license; its images and other original content retain their owners' rights.

- BAMCA: https://www.bamca.org/database.php
- Credits: https://www.bamca.org/pages/about.php

2026 Matchbox numbered product identities are attributed to JamesDiecast.com's Basic tracker, page updated September 9, 2026. Only listed numbered positions were imported; unconfirmed placeholders and chase sections were excluded. No photos, design or editorial text were copied. No Creative Commons license is asserted for that source's original content.

- https://jamesdiecast.com/matchbox/basic/tracker/

UPC facts are separately cited to Entertainment Earth's 2020 Fast & Furious Wave 5 case listing, its Matchbox basic assortment listing and NDA Toys' basic Hot Wheels assortment listing. Their original product descriptions and photos are not reproduced. Source URLs and evidence notes are retained for every barcode in `input/barcodes.json` and the runtime catalog. No affiliation or endorsement by any source or Mattel is implied.
