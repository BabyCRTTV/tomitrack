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
