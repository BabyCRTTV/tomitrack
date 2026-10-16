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
