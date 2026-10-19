# TomiTrack 0.4.13 · Early access

All app prices now display in USD, including MSRP. MSRP controls are blue; estimated-value controls are green. Price details explain the dated ECB conversion from the original tax-inclusive Japanese manufacturer price.

Added 1,254 official regular Tomica MSRP references, alongside the existing 1,680 TLV prices. Coverage is partial; unmatched or ambiguous products stay unpriced. The fallback is now MSRP × 1.10 per calendar year since catalog release, clearly labeled as an MSRP-based estimate. At least three verified comparable sales still take priority; two additional reviewed eBay sales bring the total to three across different products, still insufficient for a reliable average. Mercari and auction candidates without a verified exact variant/date are excluded.

Sync price data remains below App updates in My garage and downloads the reviewed public snapshot. New priced Tomica-family copies default to linked valuation. Existing manual choices, purchase costs, editable fallback values, backups, catalog identities, English overlays, photos and Android safe-area handling are preserved.

Android code 19 uses the permanent signer. Physical Android upgrades/folding and Windows execution remain untested.


Public pricing refresh runs on a separate GitHub Actions schedule targeting every 48 hours (elapsed-time gating across month boundaries; scheduler delays are possible). It refreshes dated ECB USD conversion and exact known manufacturer evidence; changed/ambiguous Tomica pages retain prior evidence pending review. It does not infer new sales from retail stock or sold counters. The app checks the published snapshot every 48 hours while online/on resume, persists its last successful check, and backs off six hours after failure. Manual Sync price data remains available. New independent sold observations still require verifiable variant, condition, final price and exact date; no bulk eBay/Mercari feed is connected. Private collections never leave the device. Price-only snapshot refreshes redeploy Pages without repackaging installers; installed apps download the new overlay.
