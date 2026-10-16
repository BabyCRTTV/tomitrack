# TomiTrack working rules

- Read README.md and DEVELOPMENT-HANDOFF.md before changing the project.
- Keep the shared web app usable in browser, Electron and Android WebView.
- Preserve the red, warm ivory and muted green TomiTrack identity.
- Never mix demo and real collection persistence.
- Validate imports before replacing data; keep explicit replacement confirmation.
- Treat all user text as text. Keep Node integration disabled and native bridges narrow.
- No pricing, catalog or sync claims unless backed by implemented data sources.
- Bump package version, Android versionCode/versionName, app version and cache key together; update handoff and changelog for releases.
- Run npm test and npm run check for functional changes. Verify storage, backups and narrow screens when possible.
- Do not commit secrets or production signing keys. Keep GitHub Actions and Pages working.

- Keep account registration disabled until provider, email delivery and owner-only RLS have been verified with a real project. Never replace managed authentication with local password storage.
- Auth sessions stay in memory. Keep user storage namespaces distinct and confirm cloud/local replacement and sign-out cache removal.
- Keep every app surface legible in light and dark themes; preserve the approved public landing page desktop appearance.

- Published Android releases must use the permanent ANDROID_SIGNING_BUNDLE identity and match android/signing-certificate-sha256.txt. Never generate a replacement release key or fall back to debug signing. Increment versionCode for every published Android version.
- Preserve package ID and data paths across updates. Keep updater URLs fixed to the official repository, validate APK digest/package/version/signer, and retain Android user approval.

- Read catalog/README.md before changing catalog inputs, identities or search. Keep per-record provenance and partial coverage explicit. Never fabricate UPCs, colors, prices, exact scale or release completeness. Keep shared assortment codes separate from unique release identifiers.
- Catalog rows and private owned copies are separate. Preserve stable catalog IDs, per-copy fields and legacy backup compatibility; migrate aliases explicitly when correcting established identities. Never put collector/account data into public catalog artifacts.
- Rebuild catalog projections and SQLite after reviewed input changes; verify relationships, generated-data parity, barcode check digits, search and linked collection entry. Do not run source scraping as part of app startup or automatic release builds.

- Update only application version fields structurally. Never use a global string replacement across dependency lockfiles; validate installer dependency resolution when package metadata changes.

- Catalog date ranges in the UI come from coverage records. When extending history, preserve the existing release subset and canonical casting names; read older source section headers within their own regional tables. Keep year/SKU enrichment evidence conservative.

- Before resuming, inspect remote main, recent commits, releases and Actions. Record the distinction between local work, published web state and released binaries in DEVELOPMENT-HANDOFF.md. Never report release success from a version string alone.
- During substantial catalog work, secure reviewed inputs and generated data in a reachable checkpoint branch/commit before lengthy packaging or further expansion. Record the commit in the handoff; uploaded blobs alone are not a durable publication checkpoint. Never deploy a catalog-only checkpoint branch as the application.
- Tomica: preserve Japanese names and per-release aliases; never infer toy release years from vehicle years or assign dates to undated products. Keep future/date-uncertain announcements and unavailable archives explicit. Read catalog/README.md and input/tomica-fetch-report.json. Preserve the full Mattel-subset regression hash when adding brands.

- New garage/wishlist entries must come from a real catalog selection. Do not reintroduce manual-entry fallbacks or demo-fixture creation paths. Keep linked release identity fixed on save while preserving per-copy details, existing legacy entries and backup compatibility. Brand card garage progress counts distinct linked owned releases, not quantities or wishlist entries.

- Brand artwork must stay top-aligned when captions wrap on narrow screens. Brand cards open scoped catalog views with Back to brands; clearing filters must preserve the opened brand.
