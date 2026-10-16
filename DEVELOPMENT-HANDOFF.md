# Development handoff · 0.4.0

## Current continuation checkpoint · 2026-10-16

Working version: 0.4.0, Android versionCode 6, catalog snapshot 2026.10.16.3. At recovery, remote main was 06e70948d8864830aabe391fe14f5c76380deae2; latest published release was v0.3.0, with successful Android/Windows and Pages workflows. Recovered unpublished local commits 03a39eb (2009–2013 expansion) and f293bcb (responsive UI). **0.3.1 was never published.** Their implementation is included in 0.4.0.

Catalog: 17,920 records, 6,807 casting entities, 2,311 yearly series. Breakdown: Hot Wheels 10,698; Matchbox 2,954; Tomica 2,584; Limited Vintage family 1,684. All 13,652 Mattel rows are preserved byte for byte by regression hash. Tomica begins in 1970, TLV in 2004; every annual range remains partial. 1,677 official TOMYTEC JAN links complement five Mattel UPCs and two shared assortment codes. Japanese/English discovery, source details, known scale/date fields, collection/wishlist entry and SQLite alias search are implemented.

Read catalog/README.md before catalog changes. Source facts come from official monthly Takara Tomy pages (2020 onward), official TOMYTEC catalog and separately labeled historical CarLove collector references. Gaps: 283 undated products (including Tomica Limited), 72 requested monthly pages from 2014–2019 returning 404, 88 future/date-uncertain listings withheld. Month-only dates must have fully elapsed at cutoff. Collector-only current-year rows are withheld without dated corroboration. No production completeness, photos or market pricing claims.

Private storage namespaces, package ID, signing certificate, backup schema and account configuration remain unchanged. New SQLite catalog columns are additive; the public SQLite file contains no private collections. Unicode search is separate from frozen legacy ASCII identity generation. Preserved collection links and per-copy edits are tested. Registration remains disabled; Windows native automatic updating remains outstanding. Do not enable accounts before the backend guide’s real-provider/RLS/email checks.

Local verification: 44 Node tests and syntax checks passed during implementation; final check results and publication status are recorded below. JSDOM/fake IndexedDB smoke passed older-year/Mattel/Tomica search, source details, scale/JAN prefilling, collection/wishlist saves, edit/ownership cues, filters and expandable forms. Hardware folding, actual Android install/upgrade and Windows execution remain unverified. No native iOS build is provided; layout rules need physical Safari and foldable checks. Release CI rebuilds the catalog and rejects projection drift before binaries.

Next concrete priorities:
1. Establish dated official Tomica Limited evidence (2001–2013) and import withheld references only when supported; inspect image-based official history with careful verification.
2. Reconcile uncertain duplicate/casting links across collector and manufacturer naming, using explicit aliases/migrations if published identities change.
3. Expand historical variant/color/package/commemorative coverage and retain explicit family/year gaps.
4. Test 0.4.0 upgrades and live folding on hardware; retain early 0.1/0.2 backup migration guidance.
5. Provision and verify Supabase/email/owner-only RLS, then test real accounts and safe synchronization before activation. Continue Windows update implementation.

### Interrupted upload recovery

The earlier upload stopped before moving remote main. The retained upload manifest and recovery results show a partial blob upload: some objects were retrieved, while subsequent inputs/modules returned 404. A recovery checkout retained the unpublished 2009–2013/UI commits and reconstructed Tomica modules. The exact 17,920-row catalog and completed documents were recovered from verified GitHub blob hashes; generated web/JSON/import-report hashes match the previously tested outputs. Tomica inputs are now the reviewed normalized projection, with original source links and stable IDs; the manual evidence fetcher refreshes hashes without automatically rewriting reviewed records. The observable failure was incomplete publication, not missing catalog generation. Internal platform/connection causes remain unconfirmed because diagnostic server/session logs were unavailable.

### Publication status

**0.4.0 is published and verified.** Remote implementation commit: `c9e681b71e396b5066b80d33e08038c618c45e3d` (tree `e210ed133a8a11c99fd827ab1395d3de28d648ab`, identical to the tested local tree). The recovered full catalog was first secured on branch `recovery/catalog-checkpoint-0.4.0` at `442538cc83d8e1a4eb3e098979b4977e014b2c52` before completing the source upload. Do not deploy that catalog-only checkpoint branch; use main.

- Build run [38947123464](https://github.com/BabyCRTTV/tomitrack/actions/runs/38947123464): verification, Windows, signed Android/native tests and release jobs all succeeded. CI rebuilt projections without drift and passed all 44 Node tests and syntax checks.
- Pages run [38947123337](https://github.com/BabyCRTTV/tomitrack/actions/runs/38947123337) succeeded. The downloaded live catalog module exactly matches Git blob `da90c96a2eac37933b2170abbd03cad9bf4a5455`; live version/cache modules also match the release.
- [v0.4.0](https://github.com/BabyCRTTV/tomitrack/releases/tag/v0.4.0) contains APK, Windows installer, SQLite catalog and SHA256SUMS. Downloaded APK and SQLite hashes match the manifest. The APK's permanent signer, package, non-debuggable status, versionName 0.4.0/versionCode 6 and bundled catalog were independently checked. SQLite foreign keys/integrity and alias search pass with all 17,920 rows. The Windows manifest hash matches GitHub's asset digest; physical Windows execution remains unverified.
- App smoke checks passed catalog loading/pagination, exact and shared barcode search, historical years, linked collection/wishlist saves and edits, ownership cues, related casting navigation, filters, coverage and escaping. Hardware folding and physical Android install/upgrade remain unverified.
- At the owner's explicit request, an evidence-based public report was submitted to OpenAI: [openai/codex#54684](https://github.com/openai/codex/issues/54684). It distinguishes confirmed partial publication from an unknown internal platform cause. No credentials, signing materials or private transcripts were included.

Next work starts from published 0.4.0, not the old 0.3.0 remote checkpoint. Continue the research and account/native priorities listed above; do not regenerate the recovered catalog from scratch.

## Preserved architecture and prior implementation record

The sections below retain historical 0.3.1-era validation and counts. The current checkpoint and verified 0.4.0 publication record above supersede their version/status statements.

Shared web app used by GitHub Pages, Android WebViewAssetLoader and sandboxed Electron. Version 0.2 refines the portfolio interface and adds full Light/Dark/Follow device themes, stored as preferences only. Native system bars/title appearance follow the theme. Public landing page keeps the previously approved desktop layout and mobile refinements.

## Accounts: implemented, awaiting activation

Official Supabase JS client 2.118.0 is bundled locally. Account UI includes email/password registration, email-code confirmation, sign-in, password reset with code, password change and sign-out. Client passwords are not persisted; session tokens are memory-only. Account data is keyed by authenticated user ID; legacy guest data remains at `collection`. Manual sign-out asks before removing the account's local cache. Automatic session loss returns to guest without deleting cached unsaved account entries. Local collection storage is not encrypted at rest.

The Supabase plugin was discovered but is not connected. `web/app/auth-config.js` is deliberately disabled and blank. The UI clearly reports registration is awaiting activation and never accepts a substitute local password. Read `backend/README.md` before enabling accounts. Apply the owner-only RLS migration and verify two users and anonymous access, configure real email delivery, require confirmation and configure the OTP email templates before activation. No real-provider sign-up, email, recovery or RLS tests have been run yet.

Optional private account backup upload/restore is implemented behind authentication. It is explicit, includes photos, supports 10 MB and requires confirmation before overwrites. It is not continuous synchronization. Guest collection copying is explicit and never automatic. Supabase API responses are outside service-worker caching. Android's native network allowlist is generated from the configured project host; it is empty until activation. Native updater uses INTERNET and REQUEST_INSTALL_PACKAGES; no camera or broad storage access.

## Validation and release

39 domain/account/theme/updater/catalog unit tests pass, including generated-data parity, all catalog references, barcode semantics, collection metadata round-trip and actual SQLite joins/FTS/integrity. Account tests use a mocked SDK; they do not verify a live provider. JSDOM/fake IndexedDB smoke checks passed saving/totals, editing, wishlist acquisition, search/clear, text escaping, demo isolation, dark theme persistence and the disabled account state. CSS syntax checks passed. Native CI builds and Pages publish are checked during release. Physical Android/Windows testing remains needed.

Run `npm test` and `npm run check`. To regenerate the vendored SDK, run `npm ci` then `npm run bundle:auth`; the static site and native builds consume the tracked vendor bundle. `npm run prepare:android` bundles assets and generates the exact allowed auth host. Do not commit generated resources or any private credentials.

Android 0.2.1 implements AppUpdater plus pure Java UpdatePolicy tests. Optional launch checks are throttled to once per day, download progress appears in Settings, and installation uses Android confirmation. Native download digest, package/version and signer checks precede the system installer. The web/Windows surfaces link to releases and do not pretend to have a native updater.

The original signing cache never persisted; published 0.1.0/0.2.0 certificates differ. Neither original private key was recovered. Those installs require the documented one-time JSON backup/uninstall/install/import migration. A permanent PKCS12 identity is prepared; only its public certificate fingerprint is committed. The private recovery ZIP was saved separately for the owner (Library ID libfile_602ab5c921cc8191955ed3898d7017c7). Never commit its bytes/password. The owner authorized storing the signing identity on October 16, 2026. Repository Actions secret ANDROID_SIGNING_BUNDLE is installed; GitHub confirmed creation. The release workflow deliberately fails if it is missing or the certificate changes. The feature-branch validation workflow builds unsigned and runs five native policy tests. Both Android CI validation runs passed compilation and all five native policy tests. A 0.2.1 APK was signed locally from validated CI output; apksigner v2/v3 verification and the release verification script passed against the permanent fingerprint, package ID and versionCode 3. Signing-bundle preparation was validated privately. Native Settings smoke checks passed progress, busy buttons, install retry, auto-check and text escaping. Signed install/upgrade on a physical Android device remains unverified.

Windows NSIS builds remain unsigned. All application version fields and service-worker cache are 0.3.1; Android versionCode is 5. Catalog snapshot is 2026.10.16.2. See ANDROID-UPDATES.md for release operations.

## Catalog foundation

Read catalog/README.md. Public inputs produce catalog/catalog.json and web/app/catalog/data.js using scripts/build-catalog.mjs. Runtime lazily loads the local ES module on catalog entry, which works with Pages, Android assets and Electron's file origin. The service worker precaches the catalog and modules. Search uses precomputed normalized fields and stable base ordering; 48 results are rendered per page. GTINs normalize to 14 digits after validating check digits; shared assortment references are separate from release links. No search queries, photos or collections go to catalog sources.

There are 13,652 release records: 10,698 Hot Wheels and 2,954 Matchbox; 3,296 casting entities and 2,044 yearly series. Every 2009–2026 brand/year has partial records. Matchbox 2026 has 93 source-listed numbered basic positions; their MAN links remain provisional. Source snapshots, retrieval hashes, per-release references, unknown fields, duplicate merges and rejected rows are explicit. Wiki-derived text facts have CC BY-SA attribution; other reference sources are not falsely labeled CC. No source images or article prose are copied. Do not infer original photo rights from a wiki footer license.

Collection records now retain catalogReleaseId/catalogCastingId, releaseYear, productCode, collectorNumber, seriesNumber, manNumber and upc. Existing v1 JSON backups remain compatible. The IDB/account namespaces are unchanged. Selecting a catalog release opens details first; Add to collection/wishlist opens an editable form with zero prices and unknown scale left blank. It never saves automatically. Per-copy color/photo/condition/prices/notes remain independent of catalog updates. Ownership and related casting/series browsing are implemented. Release provenance and annual coverage are visible in the app. The original eight illustrative entries remain demo fixtures only.

scripts/build-catalog-db.py generates the public release asset artifacts/TomiTrack-catalog.sqlite with 12 related tables, FTS5, indexes, source evidence and coverage. Foreign-key and integrity checks are required before writing it. GitHub release generation adds it to SHA256SUMS. No cloud database was activated; independent catalog refresh/moderation is future work.

Catalog UI smoke checks passed lazy load, SKU results, linked details, collection/wishlist saves, edits, duplicate ownership cue, related casting navigation, shared/exact UPC results, year filtering, provenance/coverage and text escaping. Existing collection and updater smoke checks remain passing. Feature-branch Android compilation and all five native tests passed. The live Pages catalog loaded and returned expected release/series/SKU results. Browser review corrected search icon alignment. An initial Windows build caught unintended dependency-version substitutions during the app version bump; the lockfile was restored from 0.2.1 and only its root application version fields were changed. Installer dependency resolution and the signed release are rechecked before publishing binaries. Physical-device installation and Windows execution remain unverified.

Next: expand source coverage, validate remaining casting/release/UPC assignments, then connect Supabase, provision/verify the backend and SMTP, then activate configuration and test all account flows. Afterwards focus on a verified catalog, better model imagery and priced data sources.

## 0.3.1 historical extension

Added 3,487 sourced 2009–2013 rows (2,428 Hot Wheels, 1,059 Matchbox). Existing 10,165 release records, IDs and metadata are unchanged; a SHA-256 regression assertion protects that published subset. Earlier source rows are appended after established imports to preserve casting names. Old Matchbox themed headings are read from the relevant preceding section within the regional mainline table. Categories remain mainline or promotional where supported; unimported ranges and UPCs are not inferred. Year filters, summary range and coverage tables now derive their years from the catalog coverage data.

Version 0.3.1 uses Android versionCode 5 and catalog snapshot 2026.10.16.2. Dependency lock changes are limited to the two root application version fields. Signing identity, package ID, private collection namespaces and backup format are unchanged. Source refresh remains a manual operation. Release checks cover the older year filters, SKU/series/MAN searches, cross-year casting links, collection/wishlist backup fields, previous release identity preservation, SQLite and packaged assets. Physical Android installation and Windows execution remain unverified.

### 0.3.1 usability and foldable layouts

Mobile navigation now exposes Collection alongside Portfolio, Explore, Wishlist and My garage. Add model remains in page headers and portfolio actions. Catalog filters remain collapsed until opened, retain open/closed state through changes, display removable active filter chips and derive all years from coverage. Collection results show a Clear filters action when filtering.

Add/edit groups core fields first, release identifiers in one expandable section, and optional prices/shelf/notes in another. All form fields and saved metadata remain present. Compact layouts use 44–48 px controls, 16 px form inputs, dynamic viewport dialog heights, a sticky form save area, safe-area padding and stronger long-text wrapping. Up to 960 CSS pixels, navigation stays below content; 701–960 px has two catalog columns and three collection columns. Under 380 px, forms and filter controls use one column. Desktop landing-page CSS is unchanged. These are responsive viewport rules, not user-agent device detection.

Targets include Galaxy Z Fold8 cover/inner displays and iPhone Duo outer/inner browser/PWA use. Official Samsung and Apple specifications were reviewed; hardware resolutions do not guarantee CSS viewport dimensions. Android handles orientation, screen size, smallest screen size, screen layout and density changes without recreating the Activity, keeping the live WebView/form during folding. This is not a native iOS build. Physical folding, device keyboard/safe-area behavior and iOS Safari testing remain necessary.

Local validation for this update: all 39 Node tests and JS checks pass. JSDOM/IndexedDB smoke checks pass the older-year collection/wishlist flows, direct mobile Collection navigation, removable filter chips, filter-panel persistence, grouped form values and preservation through a window resize event. CSS parsing and dependency lock resolution pass. Mobile rendering, actual device folding and Safari keyboard behavior are not verified by these DOM checks.
