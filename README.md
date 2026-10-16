# TomiTrack by TomiKing

A diecast collection tracker for Android, Windows and the web. Version 0.2.0 is a local-first early-access foundation.

## Use it

- Website and browser app: https://babycrttv.github.io/tomitrack/
- Android APK and Windows installer: https://github.com/BabyCRTTV/tomitrack/releases/latest
- Browser demo: https://babycrttv.github.io/tomitrack/app/?demo=1

Track model name, brand, scale, series, variant, packaging condition, quantity, purchase cost, estimated value, shelf, notes and a photo. Search/filter/sort, maintain a wishlist, move purchases into your collection, and export/import portable JSON backups. CSV exports are available for spreadsheets.

## Scope and data

Accounts are implemented but registration awaits backend activation. The app clearly reports this state. Until activated, data stays in IndexedDB on each device. Once enabled, account collections are isolated by user ID, and users can explicitly upload or restore a private cloud backup. There is no automatic live sync. JSON backups include photos; CSV does not. Import replaces the collection after confirmation. Collection history records manual estimates when records change. It is not market performance. USD only in this first version. Starter catalog entries and generic car illustrations demonstrate the workflow; they are not a verified release catalog. The demo never writes into your real collection.

Android early access uses a development signing key cached in Actions; it is not a Play Store release. Export a backup before updates, because loss of the cached signing key could require reinstallation. Windows binaries are not publisher-code-signed and may show SmartScreen. Production signing and automatic updates remain future release work.

## Development

Node 22+: `npm ci`, `npm test`, `npm run check`. Serve `web/` using any static server. Electron: `npm start`; Windows installer: `npm run dist:win` on Windows. Android: Java 17, SDK 35, Gradle 8.11.1; run `npm run prepare:android` then `gradle -p android assembleDebug`.

GitHub Actions verifies the shared domain code, builds Android and Windows, publishes assets and SHA256SUMS to a versioned release. The Pages workflow publishes `web/`. Pages must use GitHub Actions as its source.

## Architecture

- `web/app/`: shared application, domain validation, IndexedDB persistence and offline browser cache.
- `web/`: TomiKing-branded landing page, downloads, privacy notice and assets.
- `desktop/`: sandboxed Electron wrapper without Node access in the renderer.
- `android/`: offline WebViewAssetLoader wrapper, scoped photo/file chooser and document export. Only INTERNET for the configured authentication host; no camera or broad storage permissions.
- `tests/`: validation, calculations, backup, filtering, account boundary and theme tests.

## Appearance and accounts

Light, Dark and Follow device modes are available in My garage. Preferences persist on the device. The app uses the official Supabase SDK with memory-only sessions; it does not save passwords or refresh tokens in browser storage. See `backend/README.md` for backend provisioning, email verification, RLS checks and activation. Configuration remains disabled until those checks pass.

## Next milestones

Live account activation and verification; verified catalog and variants; persistent production signing; attributed pricing sources; barcode identification; social features. No API keys or third-party pricing integration are included yet.

TomiTrack branding, custom icon and generated hero artwork were created for this project. Hero generation brief: a red 1:64 Japanese sports coupe on a warm ivory studio backdrop, without text or logos. The image was generated with the built-in image tool and is in `web/assets/diecast-hero.webp`. Manufacturer names are descriptive references. TomiTrack is not affiliated with Collectr.
