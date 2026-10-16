# Development handoff · 0.2.1 (staged)

Shared web app used by GitHub Pages, Android WebViewAssetLoader and sandboxed Electron. Version 0.2 refines the portfolio interface and adds full Light/Dark/Follow device themes, stored as preferences only. Native system bars/title appearance follow the theme. Public landing page keeps the previously approved desktop layout and mobile refinements.

## Accounts: implemented, awaiting activation

Official Supabase JS client 2.118.0 is bundled locally. Account UI includes email/password registration, email-code confirmation, sign-in, password reset with code, password change and sign-out. Client passwords are not persisted; session tokens are memory-only. Account data is keyed by authenticated user ID; legacy guest data remains at `collection`. Manual sign-out asks before removing the account's local cache. Automatic session loss returns to guest without deleting cached unsaved account entries. Local collection storage is not encrypted at rest.

The Supabase plugin was discovered but is not connected. `web/app/auth-config.js` is deliberately disabled and blank. The UI clearly reports registration is awaiting activation and never accepts a substitute local password. Read `backend/README.md` before enabling accounts. Apply the owner-only RLS migration and verify two users and anonymous access, configure real email delivery, require confirmation and configure the OTP email templates before activation. No real-provider sign-up, email, recovery or RLS tests have been run yet.

Optional private account backup upload/restore is implemented behind authentication. It is explicit, includes photos, supports 10 MB and requires confirmation before overwrites. It is not continuous synchronization. Guest collection copying is explicit and never automatic. Supabase API responses are outside service-worker caching. Android's native network allowlist is generated from the configured project host; it is empty until activation. Native updater uses INTERNET and REQUEST_INSTALL_PACKAGES; no camera or broad storage access.

## Validation and release

25 domain/account/theme/updater unit tests pass. Account tests use a mocked SDK; they do not verify a live provider. JSDOM/fake IndexedDB smoke checks passed saving/totals, editing, wishlist acquisition, search/clear, text escaping, demo isolation, dark theme persistence and the disabled account state. CSS syntax checks passed. Native CI builds and Pages publish are checked during release. Physical Android/Windows testing remains needed.

Run `npm test` and `npm run check`. To regenerate the vendored SDK, run `npm ci` then `npm run bundle:auth`; the static site and native builds consume the tracked vendor bundle. `npm run prepare:android` bundles assets and generates the exact allowed auth host. Do not commit generated resources or any private credentials.

Android 0.2.1 implements AppUpdater plus pure Java UpdatePolicy tests. Optional launch checks are throttled to once per day, download progress appears in Settings, and installation uses Android confirmation. Native download digest, package/version and signer checks precede the system installer. The web/Windows surfaces link to releases and do not pretend to have a native updater.

The original signing cache never persisted; published 0.1.0/0.2.0 certificates differ. Neither original private key was recovered. Those installs require the documented one-time JSON backup/uninstall/install/import migration. A permanent PKCS12 identity is prepared; only its public certificate fingerprint is committed. The private recovery ZIP was saved separately for the owner (Library ID libfile_602ab5c921cc8191955ed3898d7017c7). Never commit its bytes/password. Repository Actions secret ANDROID_SIGNING_BUNDLE is pending owner authorization. Do not merge to main before installing that secret: the release workflow deliberately fails without it. The feature-branch validation workflow builds unsigned and runs five native policy tests. Both Android CI validation runs passed compilation and all five native policy tests. A 0.2.1 APK was signed locally from validated CI output; apksigner v2/v3 verification and the release verification script passed against the permanent fingerprint, package ID and versionCode 3. Signing-bundle preparation was validated privately. Native Settings smoke checks passed progress, busy buttons, install retry, auto-check and text escaping. Signed install/upgrade on a physical Android device remains unverified.

Windows NSIS builds remain unsigned. All version fields and service-worker cache are 0.2.1; Android versionCode is 3. See ANDROID-UPDATES.md for release operations.

Next: connect Supabase, provision/verify the backend and SMTP, then activate configuration and test all account flows. Afterwards focus on a verified catalog, better model imagery and priced data sources.
