/** Reviewed incremental inputs; no source fetching during builds or app startup. */
import{readFileSync}from'node:fs';
import{canonicalGtin}from'../web/app/catalog.js';
export const releaseRefresh=JSON.parse(readFileSync(new URL('../catalog/input/release-refresh-2026-10-28.json',import.meta.url)));
export function appendReviewedTomica({castings,series,releases}){
 const d=releaseRefresh;
 if(d.schema!==1||d.cutoff!=='2026-10-28'||d.tomica.releases.length!==17||d.matchboxRows.length!==14)throw new Error('Invalid reviewed release refresh');
 for(const r of d.tomica.castings){if(castings.has(r.id))throw new Error('Reviewed casting collision');castings.set(r.id,r);}
 for(const r of d.tomica.series){if(series.has(r.id))throw new Error('Reviewed series collision');series.set(r.id,r);}
 for(const r of d.tomica.releases){
  const proof=d.reviews[r.id];
  if(releases.has(r.id)||r.brandId!=='tomica'||!/^2026-10-\d{2}$/.test(r.releaseDate)||r.releaseDate>d.cutoff||proof.releaseDate!==r.releaseDate||!r.sourceRefs.some(s=>s.url===proof.sourceUrl)||!castings.has(r.castingId)||!series.has(r.seriesId))throw new Error('Invalid new Tomica release/date '+r.id);
  releases.set(r.id,r);
 }
 for(const x of d.tomica.identifiers)if(!canonicalGtin(x.value)||x.sourceId!=='takara-tomica-mall'||!x.releaseIds.every(id=>d.tomica.releases.some(r=>r.id===id)))throw new Error('Invalid reviewed new JAN');
 return d.tomica.identifiers;
}
