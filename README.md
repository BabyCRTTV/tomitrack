# TomiTrack by TomiKing

A diecast collection tracker for Android, Windows and the web. Version 0.4.5 is a local-first early-access foundation.

## Use it

- Website and browser app: https://babycrttv.github.io/tomitrack/
- Android APK and Windows installer: https://github.com/BabyCRTTV/tomitrack/releases/latest
- Browser demo: https://babycrttv.github.io/tomitrack/app/?demo=1

Add collection and wishlist entries by selecting a release from the catalog. Brand tiles show bundled manufacturer marks, catalog counts and the distinct linked releases in your garage. Tap a brand to open its catalog; Back to brands restores the brand grid. Clear filters stays within the opened brand. New free-form entries are disabled; catalog identity stays fixed while condition, quantity, photo, inspected color/scale, purchase cost, estimate, shelf and notes remain editable. Existing legacy entries and v1 backups remain compatible. Search/filter/sort, maintain a wishlist, move purchases into your collection, and export/import portable JSON backups. CSV exports are available for spreadsheets.

## Scope and data

Accounts are implemented but registration awaits backend activation. The app clearly reports this state. Until activated, data stays in IndexedDB on each device. Once enabled, account collections are isolated by user ID, and users can explicitly upload or restore a private cloud backup. There is no automatic live sync. JSON backups include photos; CSV does not. Import replaces the collection after confirmation. Collection history records manual estimates when records change. It is not market performance. USD only in this first version. The public release catalog contains 17,920 attributed references: 13,652 Hot Wheels/Matchbox (2009–2026) and 4,268 Tomica-family references (1970 onward). Coverage is partial; it is not a manufacturer-verified complete catalog. Generic illustrations are used only in the collection/demo; source photos are not bundled. The demo never writes into your real collection.

Android 0.2.1 introduces in-app update checks, verified downloads and the Android installer. Releases require one permanent signing identity stored in encrypted GitHub Actions secrets. Android asks you to approve installation. The original 0.1.0 and 0.2.0 APKs used different, unretained development keys, so their users need a one-time backup/reinstall/restore migration. See ANDROID-UPDATES.md. Windows binaries are not publisher-code-signed and may show SmartScreen; Windows automatic updates remain future work.

## Release catalog

Search by name, series, release year, product/toy code, collector number, series position, Matchbox MAN number and known UPC/EAN. Filter by brand, year, category, series and ownership. Select a release to review its sources, add to your collection or wishlist, and browse related releases of the casting. Stable catalog IDs and release metadata survive edits and JSON backups.

Barcode coverage includes five specifically cited Mattel UPCs, 1,677 checksum-valid official TOMYTEC JAN links, and two shared basic-car assortment codes. Shared codes produce candidates and never claim to identify a unique model. Missing facts remain unknown. The public catalog is bundled offline with native apps, and a searchable SQLite download is included in releases. See `catalog/README.md` for provenance, counts, coverage and maintenance.

## Development

Node 22+: `npm ci`, `npm test`, `npm run check`. Serve `web/` using any static server. Electron: `npm start`; Windows installer: `npm run dist:win` on Windows. Android: Java 17, SDK 35, Gradle 8.11.1; run `npm run prepare:android` then `gradle -p android assembleDebug`.

GitHub Actions verifies the shared domain code, builds Android and Windows, publishes assets and SHA256SUMS to a versioned release. The Pages workflow publishes `web/`. Pages must use GitHub Actions as its source.

## Architecture

- `web/app/`: shared application, domain validation, IndexedDB persistence and offline browser cache.
- `web/`: TomiKing-branded landing page, downloads, privacy notice and assets.
- `desktop/`: sandboxed Electron wrapper without Node access in the renderer.
- `android/`: offline WebViewAssetLoader wrapper, scoped photo/file chooser and document export. Native HTTPS release downloads and the configured authentication host; Android installation approval uses REQUEST_INSTALL_PACKAGES. No camera or broad storage permissions.
- `catalog/`: sourced inputs, normalized relational catalog, import report and provenance.
- `tests/`: catalog relationships/search/barcodes, SQLite, validation, calculations, backups, account boundaries and themes.

## Responsive layouts

The app adapts to narrow cover screens, wider unfolded displays and desktop windows. Mobile navigation includes Collection and Explore; catalog filters have removable chips, and add/edit groups optional details into expandable sections. Safe-area padding and larger form controls support iPhone browser/PWA use. Android preserves its live WebView across fold-related display changes. Fold8 and iPhone Duo hardware testing remains pending; there is no native iOS package.

## Appearance and accounts

Light, Dark and Follow device modes are available in My garage. Preferences persist on the device. The app uses the official Supabase SDK with memory-only sessions; it does not save passwords or refresh tokens in browser storage. See `backend/README.md` for backend provisioning, email verification, RLS checks and activation. Configuration remains disabled until those checks pass.

## Next milestones

Live account activation and verification; expanded catalog coverage, casting links and barcode evidence; attributed pricing sources; barcode identification; social features. No API keys or third-party pricing integration are included yet.

TomiTrack branding, custom icon and generated hero artwork were created for this project. Hero generation brief: a red 1:64 Japanese sports coupe on a warm ivory studio backdrop, without text or logos. The image was generated with the built-in image tool and is in `web/assets/diecast-hero.webp`. Manufacturer names are descriptive references. TomiTrack is not affiliated with Collectr.

## Historical Tomica catalog

Version 0.4.5 integrates 2,584 Tomica and 1,684 Limited Vintage-family references. Japanese names are retained; reviewed English search aliases support discovery. Official Takara Tomy monthly announcements and TOMYTEC product records are prioritized; older numbered editions are separately labeled collector references. All coverage is partial. Tomica Limited awaits reviewed release dates; 283 undated products, 72 unavailable monthly pages and 88 future/date-uncertain listings are tracked as research gaps. See catalog/README.md.
