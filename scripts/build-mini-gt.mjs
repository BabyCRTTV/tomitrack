/** Build only the explicitly reviewed official MINI GT input; never fetch sources here. */
import{readFileSync}from'node:fs';
export const miniGT=JSON.parse(readFileSync(new URL('../catalog/input/mini-gt.json',import.meta.url)));
export function appendMiniGT({castings,series,releases,sources}){
 if(miniGT.schema!==1||miniGT.brand.id!=='mini-gt'||miniGT.releases.length!==100||Object.keys(miniGT.images).length!==100||new Set(miniGT.releases.map(r=>r.productCode)).size!==100)throw new Error('Expected 100 reviewed MINI GT releases/photos');
 sources.push(miniGT.source);
 for(const row of miniGT.castings){if(castings.has(row.id))throw new Error('MINI GT casting collision');castings.set(row.id,row);}
 for(const row of miniGT.series){if(series.has(row.id)||row.year!==null)throw new Error('Invalid MINI GT series');series.set(row.id,row);}
 for(const row of miniGT.releases){
  const p=miniGT.reviews[row.id],photo=miniGT.images[row.id],v=miniGT.verifiedAssets[photo?.url];
  if(releases.has(row.id)||row.brandId!=='mini-gt'||row.year!==null||row.releaseDate!==''||row.releaseStatus!=='Released'||row.scale!=='1:64'||!/^MGT\d{5}(?:-[A-Z0-9]+)?$/.test(row.productCode)||!p||p.productCode!==row.productCode||p.name!==row.name||p.status!=='Released'||p.visualReview!=='accepted'||!/^https:\/\/minigt\.tsm-models\.com\/index\.php\?action=product-detail&id=\d+$/.test(p.sourceUrl)||!row.sourceRefs.some(ref=>ref.sourceId==='minigt-official'&&ref.url===p.sourceUrl)||!/^https:\/\/minigt\.tsm-models\.com\/upload\/picfile_list\/[A-Za-z0-9_-]+\.(?:jpe?g|png|webp)$/i.test(photo.url)||photo.sourceUrl!==p.sourceUrl||v?.sha256!==p.imageSha256||!v.ok||v.width<500||v.height<300||!/^[a-f0-9]{64}$/.test(p.sourcePageSha256)||!castings.has(row.castingId)||!series.has(row.seriesId))throw new Error('Invalid reviewed MINI GT product '+row.id);
  releases.set(row.id,row);
 }
}
