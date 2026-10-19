// Deterministic merge keeps newly reviewed identities when a refresh file already exists.
export function mergeListingHistory(...histories){
 const rows=new Map();
 for(const history of histories)for(const x of history||[]){
  const key=x.sourceUrl+'|'+x.observedAt,old=rows.get(key);
  if(old&&(old.releaseId!==x.releaseId||old.productCode!==x.productCode||old.amountCents!==x.amountCents||old.condition!==x.condition||old.sellerId!==x.sellerId))throw Error('Conflicting reviewed listing observation.');
  rows.set(key,x);
 }
 return [...rows.values()].sort((a,b)=>a.sourceUrl.localeCompare(b.sourceUrl)||Date.parse(a.observedAt)-Date.parse(b.observedAt));
}
