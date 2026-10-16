/** Append the recovered, reviewed Tomica projection without regenerating stable identities. */
import {readFileSync} from 'node:fs';
import {canonicalGtin} from '../web/app/catalog.js';
export function appendTomica({castings,series,releases,sources}) {
 const d=JSON.parse(readFileSync('catalog/input/tomica.json','utf8'));
 if(d.schema!==1||!d.recoveredFromBlob)throw new Error('Unsupported reviewed Tomica input');
 for(const source of d.sources)sources.push(source);
 for(const row of d.castings){if(castings.has(row.id))throw new Error('Casting identity collision');castings.set(row.id,row)}
 for(const row of d.series){if(series.has(row.id))throw new Error('Series identity collision');series.set(row.id,row)}
 for(const row of d.releases){
  if(releases.has(row.id)||!row.brandId.startsWith('tomica')||!Number.isInteger(row.year)||row.year<1970||row.year>2026||!row.sourceRefs.length)throw new Error('Invalid reviewed Tomica identity');
  releases.set(row.id,row);
 }
 for(const row of d.identifiers)if(!canonicalGtin(row.value))throw new Error('Invalid reviewed JAN');
 return {identifiers:d.identifiers,merged:d.referencesMerged};
}
