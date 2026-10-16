# Development handoff · 0.1.0

Initial foundation: shared vanilla JS app, IndexedDB local storage, photo resizing, record editing, separate wishlist, manual value history, searchable starter catalog, JSON import/export and CSV export. Responsive portfolio interface, custom diecast hero landing page, native Android and Electron wrappers.

Demo mode is isolated in memory. Imports validate schema/items and replace only after confirmation. History resets on import. No cloud/market service exists. Current values are USD per-unit manual estimates.

Android builds use debug signing for early access, with the key retained by Actions cache where available. Move to a privately backed-up production signing key before public production adoption. Windows builds are unsigned NSIS installers. Physical-device smoke testing is still needed; CI compilation is not a substitute for it.

Priorities: gather UI feedback, verify actual devices, establish production signing, then model a sourced catalog with variants and stable IDs before pricing and sync.

Validation: five domain tests pass. A separate JSDOM/fake IndexedDB integration smoke check passed saving/totals, editing, wishlist acquisition, search/clear, text escaping, and demo isolation with restoration of the real collection. Pages published successfully. Initial Android setup needed explicit SDK packages because the legacy tools package is no longer available.
Windows packaging produced the installer but electron-builder attempted implicit publishing; --publish never delegates publishing to the dedicated release job.

Website-only mobile refinement (2026-10-16): appended phone styles at max-width 650px, with a 359px compact adjustment. Added a Downloads navigation link hidden on desktop. Desktop CSS rules and existing DOM elements are unchanged. App binaries remain version 0.1.0.
