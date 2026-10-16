# Development handoff · 0.2.0

Shared web app used by GitHub Pages, Android WebViewAssetLoader and sandboxed Electron. Version 0.2 refines the portfolio interface and adds full Light/Dark/Follow device themes, stored as preferences only. Native system bars/title appearance follow the theme. Public landing page keeps the previously approved desktop layout and mobile refinements.

## Accounts: implemented, awaiting activation

Official Supabase JS client 2.118.0 is bundled locally. Account UI includes email/password registration, email-code confirmation, sign-in, password reset with code, password change and sign-out. Client passwords are not persisted; session tokens are memory-only. Account data is keyed by authenticated user ID; legacy guest data remains at `collection`. Manual sign-out asks before removing the account's local cache. Automatic session loss returns to guest without deleting cached unsaved account entries. Local collection storage is not encrypted at rest.

The Supabase plugin was discovered but is not connected. `web/app/auth-config.js` is deliberately disabled and blank. The UI clearly reports registration is awaiting activation and never accepts a substitute local password. Read `backend/README.md` before enabling accounts. Apply the owner-only RLS migration and verify two users and anonymous access, configure real email delivery, require confirmation and configure the OTP email templates before activation. No real-provider sign-up, email, recovery or RLS tests have been run yet.

Optional private account backup upload/restore is implemented behind authentication. It is explicit, includes photos, supports 10 MB and requires confirmation before overwrites. It is not continuous synchronization. Guest collection copying is explicit and never automatic. Supabase API responses are outside service-worker caching. Android's native network allowlist is generated from the configured project host; it is empty until activation. INTERNET is the only additional Android permission; no camera or broad storage access.

## Validation and release

21 domain/account/theme unit tests pass. Account tests use a mocked SDK; they do not verify a live provider. JSDOM/fake IndexedDB smoke checks passed saving/totals, editing, wishlist acquisition, search/clear, text escaping, demo isolation, dark theme persistence and the disabled account state. CSS syntax checks passed. Native CI builds and Pages publish are checked during release. Physical Android/Windows testing remains needed.

Run `npm test` and `npm run check`. To regenerate the vendored SDK, run `npm ci` then `npm run bundle:auth`; the static site and native builds consume the tracked vendor bundle. `npm run prepare:android` bundles assets and generates the exact allowed auth host. Do not commit generated resources or any private credentials.

Android retains early-access development signing via Actions cache. Production signing is still a separate milestone. Windows NSIS builds are unsigned. Export JSON before updating. All version fields and the service-worker cache are 0.2.0; Android versionCode is 2.

Next: connect Supabase, provision/verify the backend and SMTP, then activate configuration and test all account flows. Afterwards focus on a verified catalog, better model imagery and priced data sources.
