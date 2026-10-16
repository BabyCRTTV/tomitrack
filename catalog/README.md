# TomiTrack public release catalog

This is a growing, interconnected reference catalog for Hot Wheels and Matchbox releases from 2014 onward. Snapshot `2026.10.16.1` contains **10,165 release records**, **2,780 casting records** and **1,661 yearly series records**. There are 8,270 Hot Wheels records and 1,895 Matchbox records, with entries in every year from 2014 through 2026. These are imported reference counts, not a complete production census.

## Relationships

Brands → castings → releases; brands/year/category → series → releases; sources → release citations; identifiers ↔ releases. Assortment barcodes are a separate relationship to a brand and category, never fabricated as unique release identifiers. Matchbox MAN IDs link known castings across years. Hot Wheels casting names are conservatively normalized; aliases preserve source naming. The 93 imported 2026 Matchbox positions currently have provisional casting records because their MAN numbers are not supplied by the source.

A release's identity is independent of a collector's owned copy. Collection records keep `catalogReleaseId`, `catalogCastingId`, release year, product code, collector number, series position, MAN number and optional UPC alongside the collector's own condition, photo, quantity, prices and notes. Saving edits and backups preserves those links. Existing v1 backups remain compatible. Snapshot values stay with the owned item even if a future catalog changes. When correcting an established identity in future, retain an alias/migration mapping instead of silently reassigning existing IDs.

## Search and categories

The installed apps load the public snapshot offline. Pages loads the same data and caches it for offline use once the service worker finishes. Names, aliases, brand, release year, series names, series positions, collector numbers, toy/product codes, MAN numbers and known UPC/EAN codes are searchable. Filters cover brand, year, category, series and ownership. Results are paginated to keep phones responsive. Categories currently include Mainline, Premium, Silver Series, Themed, Moving Parts, Collectors and Promotional.

UPC/EAN/GTIN lookups validate check digits and normalize equivalent leading-zero representations to GTIN-14. Five retailer-linked UPCs identify specifically cited 2020 Fast & Furious releases. Two common basic-car assortment codes return a range of candidates with an explicit shared-barcode notice. This is not comprehensive barcode coverage, optical barcode scanning or unique identification of every package. Unlinked codes can be kept on a collector's own record. Queries never leave the device.

## Coverage and limits

`import-report.json` records counts by brand/year, duplicate references merged and rejected input. Every imported year is explicitly `partial`. Some Hot Wheels colors, yearly series positions, packaging regions, card variants, castings/retools, retailer exclusives, multipacks and special editions are absent. Matchbox currently covers basic lineups, selected Moving Parts/Collectors/promotional records and 93 listed 2026 basic positions; additional ranges and casting links remain to be reviewed. Blank fields mean unknown. The catalog does not infer scale from a brand, generate UPCs, invent current values or treat advance listings as proof an item reached retail.

The source snapshot has known quality limitations. One malformed Hot Wheels row (`name: None`, product field containing a casting name) was rejected. 1,804 duplicate references were merged. Cross-source series-position enrichment is restricted to older row groups with at least 75% agreement by SKU with one known annual list, then requires an exact year/SKU match for each field. A repeated older 2020 group is deduplicated. Imported facts are references for the collector to check against packaging, not manufacturer verification.

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
