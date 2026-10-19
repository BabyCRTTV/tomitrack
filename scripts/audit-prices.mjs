// Owner-side coverage audit; never fetches sources or changes consumer prices.
import {readFileSync,writeFileSync} from 'node:fs';
import {valuationQuote} from '../web/app/pricing-core.js';
const bundled=(await import('../web/app/catalog/pricing-data.js')).default;
const now=Date.parse(process.argv[2]||bundled.prices.asOf);
if(!Number.isFinite(now))throw Error('Invalid audit date');
const counts={},observed=[];
for(const[id,scope]of Object.entries(bundled.scope)){
 const q=valuationQuote(bundled.prices,bundled.scope,id,'Boxed',now);
 counts[q.kind]=(counts[q.kind]||0)+1;
 if(['sold-average','listing-average','historical-listing-average'].includes(q.kind)&&q.amount!==null)observed.push({releaseId:id,productCode:scope.productCode,kind:q.kind,amount:q.amount,currency:'USD',sampleCount:q.sampleCount});
}
const out={asOf:new Date(now).toISOString(),scope:Object.keys(bundled.scope).length,counts,uniqueListingUrls:new Set(bundled.prices.listings.map(x=>x.sourceUrl)).size,listingObservations:bundled.prices.listings.length,observed};
if(process.argv[3])writeFileSync(process.argv[3],JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out,null,2));
