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
