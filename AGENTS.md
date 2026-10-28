# TomiTrack working rules

- Read README.md and DEVELOPMENT-HANDOFF.md before changing the project.
- Keep the shared web app usable in browser, Electron and Android WebView.
- Use the owner-requested pink (#ed6aa7) and yellow (#ffe36b) for the app logo and platform icons. Preserve the existing interface palette.
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
- Rebuild catalog projections and SQLite after reviewed input changes; verify relationships, generated-data parity, barcode check digits, search and linked collection entry. Do not run source scraping as part of app startup or automatic release builds. Owner-authorized pricing refresh is a separate 48-hour workflow; validate exact known manufacturer records and FX before publishing, retain ambiguous evidence for review.

- Update only application version fields structurally. Never use a global string replacement across dependency lockfiles; validate installer dependency resolution when package metadata changes.

- Catalog date ranges in the UI come from coverage records. When extending history, preserve the existing release subset and canonical casting names; read older source section headers within their own regional tables. Keep year/SKU enrichment evidence conservative.

- Before resuming, inspect remote main, recent commits, releases and Actions. Record the distinction between local work, published web state and released binaries in DEVELOPMENT-HANDOFF.md. Never report release success from a version string alone.
- During substantial catalog work, secure reviewed inputs and generated data in a reachable checkpoint branch/commit before lengthy packaging or further expansion. Record the commit in the handoff; uploaded blobs alone are not a durable publication checkpoint. Never deploy a catalog-only checkpoint branch as the application.
- Tomica: preserve Japanese names and per-release aliases; never infer toy release years from vehicle years or assign dates to undated products. Keep future/date-uncertain announcements and unavailable archives explicit. Read catalog/README.md and input/tomica-fetch-report.json. Preserve the full Mattel-subset regression hash when adding brands.

- New garage/wishlist entries must come from a real catalog selection. Do not reintroduce manual-entry fallbacks or demo-fixture creation paths. Keep linked release identity fixed on save while preserving per-copy details, existing legacy entries and backup compatibility. Brand card garage progress counts distinct linked owned releases, not quantities or wishlist entries.

- Brand artwork must stay top-aligned when captions wrap on narrow screens. Brand cards open scoped catalog views with Back to brands; clearing filters must preserve the opened brand.

- English presentation overlays must preserve original Japanese facts, aliases and private snapshots. New Tomica data requires reviewed English before publication; do not ship machine guesses or unreviewed romanization. Keep English series filter options consistent with displayed release series.
- Publish images in explicit reviewed batches with owner-authorized sizes (four 500-entry Tomica-family batches and eight Matchbox batches of 200, 250, 300, 140, 425, 500, 200 and 846 (owner authorized completing remaining source-backed coverage); authorized cumulative total: 4,861). Preserve original batch archives, all previously active photos and evidence; reject manufacturer unavailable-image notices as photos. Retain research candidates separately from active browser/SQLite photos, record source attribution and verification, label casting/missing images and preserve private photo priority. Source fetching/image verification never runs in startup or CI builds.

- Android system-bar/cutout/keyboard insets belong to the native FrameLayout around WebView, not WebView padding. Forward zeroed handled inset dimensions (including hide events) to avoid duplicate/ghost spacing. Preserve browser CSS safe-area support and the live WebView during fold/window changes.

- Pricing standard: Tomica and TLV only until the owner expands scope. All app prices, including MSRP, display in USD; retain original currency amounts as source evidence. Prefer at least three recent confirmed single-item exact-variant/condition sales; never present asking prices or hidden Best Offers as sold data. Without three comparable sales, use at least three independent current asking listings (30 days), then historical asks (180 days), then the owner-directed MSRP-based pricing reference with 10% annual growth (UTC calendar year minus catalog release year), with dated JPY→USD evidence and a clear explanation on tap. Without usable listing/sold/MSRP evidence there is no automatic value. Preserve manual fallback/purchase costs, backup valuation mode and existing manual choices. Automatic client checks download the validated public overlay at most every 48 hours, with offline/failure backoff; never embed marketplace credentials or transmit collection data.

- Shared pricing applies to all priced Tomica/TLV references and linked collection/portfolio values, without per-model overrides. Latest observation per listing and one comparable per seller; apply 1.5-IQR exclusion at 5+ observations. Boxed/unopened asks share an explicit group; loose is separate; sold comparisons remain condition-specific. Keep marketplace/source URLs, seller identities and provenance in research data. Consumer controls read only Market Price (green) and MSRP (blue) plus their USD amounts. No subtitles or supplier/currency-conversion branding on the tags; keep both tags side by side on narrow screens. Basis/sample/range/dates and the indicative-price explanation are available only on tap; no estimate labels or supplier links on controls. Exact reviewed listing watches refresh in the separate 48-hour workflow; new marketplace identities require review.

- Catalog photo prices: keep the green Market Price button in the same media column as the thumbnail, matching its width with an 8px gap; center the label above the USD amount. Use the shared release quote and open existing pricing details on tap. Preserve card text, wishlist and add actions.

- Owner authorization (2026-10-19): publish requested future updates without asking for approval again unless the owner explicitly requests approval or a preview first.

- Owner confirmed 2026-10-19: market listing averages use item prices only, excluding shipping, tax and checkout totals. Keep the owner-directed MSRP fallback base followed by 10% annual growth when comparables are insufficient; keep internal base parameters out of public-facing text. Do not reject a correct comparable solely because its shipping charge is high. Preserve exact variants/condition groups, one comparable per seller, original price dates on status changes, and merge reviewed seeds with refresh history. Catalog headline uses the boxed reference; private copies use saved condition.

- Owner confirmed 2026-10-21: internal pricing parameters may be visible in public source code and tests. Keep those parameters out of app text, consumer explanations and release notes.

- Owner authorization (2026-10-28): finish the remaining Matchbox catalog photos. The thirteenth reviewed batch adds 93 numbered 2026 package references from Matchboyz (4,954 cumulative; all 2,954 existing Matchbox rows). Preserve the twelve earlier archives and every prior image/proof. Supplemental `catalog/input/matchbox-2026-images.json` retains per-photo photographer credit, exact source record/year/number, page/image hashes and visual review. Do not broaden source image access beyond the explicit 2026 Basic photo endpoint. Global lineup coverage remains partial.

- Owner authorization (2026-10-28): check and apply new Matchbox/Tomica releases. Reviewed refresh `catalog/input/release-refresh-2026-10-28.json` adds 14 Matchbox (11 mainline/3 Super Chase), 17 exact-date Tomica and 31 photos in batch `2026-10-28-014` (4,985 cumulative). Preserve all 17,920 prior release records and all 4,954 prior images/proofs. Keep three Super Chase numbers distinct from mainline; the source’s school-bus 094/120 typo is corrected to photographed 94/125 only for this new reference. Keep delayed Delica Mini/Premium Hiace (2026-11-28) and current-month month-only TLV products excluded. New official mall image access is restricted to `/img/goods/L/<JAN>_<32 lowercase hex>.jpg`.
