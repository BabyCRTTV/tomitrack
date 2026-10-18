# Changelog

## 0.4.7 — 2026-10-18

- Added 500 more reviewed official Limited Vintage-family photo entries, bringing source-photo coverage to 2,000.
- Preserved all prior 1,500 photo references, source attribution, original resolution, uncropped framing and private-photo priority.
- Skipped unavailable and below-quality source images; retained the authorized 500-entry batch size.

## 0.4.6 — 2026-10-18

- Added 500 more reviewed Limited Vintage-family photo entries, bringing coverage to 1,500 entries.
- Retained source-provided resolution and framing, credits, explicit casting-reference labels and the prior 1,000 entries unchanged.
- Added regression checks for complete prior-batch preservation and casting-photo provenance.

## 0.4.5 — 2026-10-18

- Added 500 reviewed official Limited Vintage-family product photos at 600×400, bringing source-linked photo coverage to 1,000 entries.
- Preserved the original 500 image references and English/catalog identities; retained uncropped 4:3 framing, source credits and personal-photo priority.
- Archived individual batches, excluded two manufacturer unavailable-image notices, and made manual batch preparation append exactly 500 new entries with cached verification.

## 0.4.4 — 2026-10-17

- Added a separate Add to collection shortcut beside View release on catalog cards.
- Added a small wishlist heart beside the muted brand/category label, with a filled state for existing wishlist entries.
- Kept catalog-linked save forms, owned counts and independent accessible tap targets; spaced actions together beneath narrow-screen cards.

## 0.4.3 — 2026-10-17

- Added English names, colors and series presentation for all 4,268 Tomica-family references, preserving Japanese search, source facts, IDs and private collection snapshots.
- Added a capped first batch of 500 source-linked Tomica/TLV photo entries, consistent uncropped framing, source credits and explicit reference/missing-photo labels. Remaining discovered image links are queued.
- Collection cards, details, linked editing and series filters use the English presentation. Photos load online; personal photos retain priority.
- Added public SQLite English/image tables and restricted image endpoints for browser and Android.

## 0.4.2 — 2026-10-16

- Anchored brand artwork and captions to the top so long Limited Vintage labels cannot shift the card on narrow fold cover screens.
- Brand taps now open a dedicated catalog view with a brand heading, isolated results and Back to brands navigation. Clear filters stays within that brand.

## 0.4.1 — 2026-10-16

- Replaced cramped brand buttons with responsive logo cards, garage counts and clear selection states in light and dark themes.
- All Add actions now open catalog search. New collection/wishlist entries require a selected catalog release; identity fields stay attached to that release.
- Removed manual-entry fallback and demo-fixture creation paths. Per-copy details, existing entries and backup compatibility remain intact.
- Bundled brand marks and the garage save policy for offline browser/native use.

## 0.4.0 — 2026-10-16

- Recovered the unpublished 2009–2013 expansion and responsive collection/form/filter improvements; 0.3.1 was never published.
- Added 4,268 Tomica-family references, bringing the catalog to 17,920 records. Tomica history starts in 1970; Limited Vintage-family references start in 2004. Every range remains partial.
- Preserved Japanese names and added reviewed English search aliases, official release-date/scale fields, and 1,677 official checksum-valid JAN links.
- Integrated Japanese catalogs with collection/wishlist workflows, coverage/source views, offline assets and SQLite aliases/full-text search.
- Preserved all 13,652 existing Mattel records and stable IDs; private collection storage and backup schema remain unchanged.
- Tracked 283 undated products, 72 unavailable monthly archives and 88 withheld future/date-uncertain listings. Tomica Limited and historical variants remain incomplete.
- Added deterministic catalog generation checks to the release workflow. Accounts remain disabled pending backend verification.

## Recovered 0.3.1 development — 2026-10-16

- Extended the catalog to 2009–2026 with 3,487 additional 2009–2013 references: 2,428 Hot Wheels and 1,059 Matchbox. Total: 13,652 releases, 3,296 linked castings and 2,044 yearly series. Coverage remains partial.
- Preserved all 10,165 existing release records and catalog links, and linked historical releases through casting and MAN identities.
- Retained older Matchbox themed mainline sections, source citations and regional references. Expanded year filters and coverage tables from catalog data.
- Updated the offline app catalog and public SQLite download. Barcode evidence remains unchanged.
- Simplified mobile navigation and catalog filters with direct Collection access, removable filter chips and persistent filter-panel state.
- Grouped add/edit fields into expandable sections; improved touch targets, compact dialogs, save controls and safe-area spacing. Added responsive cover/inner-display layouts for foldable phones and prevented Android Activity restarts during display-size/density changes. iPhone support is through the web/PWA.
- Kept the permanent Android signing identity for in-place updates.

## 0.3.0 — 2026-10-16

- Added an attributed public catalog with 10,165 Hot Wheels/Matchbox release references, 2,780 linked castings and 1,661 yearly series from 2014–2026. All annual coverage remains explicitly partial.
- Added name, series, collector number, series position, product code, MAN number and known UPC/EAN search, plus brand/year/category/series/ownership filters and pagination.
- Added release detail, casting/series navigation, source citations, coverage tables and collection/wishlist entry from search.
- Preserved catalog links and release fields through edits, local search, CSV exports and existing-format JSON backups.
- Added checksum-valid UPC/EAN normalization with separate release and shared-assortment relationships. Barcode coverage is limited to five specific releases and two assortment codes.
- Added a portable SQLite catalog with foreign keys, indexes, full-text search, provenance and release checksums. Source import/build tools retain an audit trail.
- Kept the permanent Android signing identity; 0.2.1 installs can update in place.


## 0.2.1 — 2026-10-16

- Added optional daily Android update checks, Settings controls, download progress and Android-approved installation.
- Verify official release URL, SHA-256 digest, package, newer version and matching installed signer before installation.
- Replaced unreliable debug-key caching with a required permanent release identity and certificate verification in CI.
- Documented one-time backup/reinstall migration for early APKs with incompatible signing keys.


## 0.2.0 — 2026-10-16

- Refined portfolio hierarchy, range controls, statistics, valuable model rows and collection cards.
- Added persistent Light, Dark and Follow device settings, including native appearance hooks.
- Added managed email/password account integration, code verification and password reset/change flows.
- Separated guest/account collections and added explicit private cloud backup integration.
- Added owner-only RLS migration and backend activation guide. Accounts remain disabled until the real provider and email delivery are verified.

## Website update — 2026-10-16

- Improved phone navigation, text sizes, tap targets, hero layout and download cards.
- Desktop appearance and app version remain unchanged.

## 0.1.0 — 2026-10-16

- Initial diecast portfolio, collection and wishlist.
- Manual record entry, photos, quantities, conditions, shelves and notes.
- Manual estimates, purchase totals and recorded value history.
- Search, brand filters, sorting, grid/list views and starter catalog.
- Portable JSON backups including photos; CSV exports.
- Separate demo collection and responsive mobile/desktop interface.
- Android early-access APK, Windows installer and GitHub Pages site.
