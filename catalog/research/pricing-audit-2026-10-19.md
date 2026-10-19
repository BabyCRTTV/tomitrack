# Pricing audit · 19 October 2026

The main gap was evidence coverage. Before this update, only one model had enough independent listing data; 2,933 displayed values used the owner's MSRP growth fallback. The owner confirmed that the consumer standard should use rolling averages of **item prices only** and explicitly retained that fallback for sparse data.

## Published result

v0.4.16 watches 45 listings across 14 exact references. Nine references now meet the independent-seller threshold. Eight move from the MSRP fallback to observed listing averages; the yellow LV-86b remains at $140.00.

| Exact reference | Previous USD value | Listing average | Sellers used |
| --- | ---: | ---: | ---: |
| LV-86h | $29.24 | $36.90 | 3 |
| LV-86b | $140.00 | $140.00 | 3 |
| LV-N305e | $27.84 | $46.07 | 4 |
| LV-N106e | $25.27 | $35.14 | 4 |
| LV-N54d | $27.57 | $57.39 | 3 |
| LV-86g | $30.27 | $36.94 | 5 |
| LV-N305d | $27.84 | $47.12 | 4 |
| LV-86f | $30.27 | $39.38 | 4 |
| LV-110c | $29.24 | $41.25 | 3 |

Values are a dated snapshot and will move with observed item asks. Existing 1.5-IQR screening applies at five or more independent observations; counts above are after screening. No per-model override was introduced.

## Shared rules

- Match the exact release code, variant and condition group.
- Average the current item amounts, excluding shipping, tax, checkout totals, crossed-out prices and quantity-dependent discounts. Accept explicitly displayed marketplace USD conversions only when they match the structured item amount.
- Use the newest observation for each listing and one comparable per seller. Repeated polling does not increase the sample count.
- Keep current asking observations within 30 days and historical asking prices within 180 days. Preserve the original price date when a listing ends.
- Keep verified sales separate from asks; a qualifying exact-condition sold average retains priority. Current evidence contains only three isolated sold observations, so no model currently qualifies for a sold average.
- Retain the owner-approved MSRP × 1.10^age fallback when comparables are insufficient.

The catalog uses a boxed reference condition. Collection copies use their saved condition and preserve manual fallback values and purchase costs.

## Corrections

The old build selected the refresh file instead of merging newly reviewed listings, hiding coverage additions. The builder and scheduled refresh now merge both sources and reject conflicts. Listing-ending checks append status evidence without making the prior price appear new. Refresh pins the actual item seller card instead of accepting a seller link anywhere on a page. Catalog headlines no longer select a loose-price group over the boxed reference.

Seventy successfully read pages were reviewed across the audit. Research-only candidates remain separate. A two-car lot and an LV-86g title paired with a blue car photo were explicitly excluded. Source hashes, titles, photos, dates and decisions are retained in [listing-audit-2026-10-19.json](listing-audit-2026-10-19.json).

## Maintenance and limits

The separate 48-hour workflow refreshes the known watched identities; it does not automatically discover new listings. Manual public-page research is supported by scripts/research-price-listings.py, which saves candidates without activating them. scripts/audit-prices.mjs reports actual coverage.

The remaining 2,925 priced references still use the fallback, and 1,334 scoped references lack usable pricing. Those figures have not all been replaced with market research. Expanding the independently reviewed listing pool is the next substantive improvement.

All 80 automated tests, focused pricing regressions, syntax checks, database integrity checks and release builds passed. Downloaded APK pricing modules match tested source, and the released SQLite matches the local export across all 17 non-FTS tables. Physical Android and Windows execution was not performed.

[Published v0.4.16](https://github.com/BabyCRTTV/tomitrack/releases/tag/v0.4.16)
