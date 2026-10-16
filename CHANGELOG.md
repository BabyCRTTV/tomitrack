# Changelog

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
