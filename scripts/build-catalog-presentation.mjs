import{releaseRefresh}from'./release-refresh.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {allowedCatalogImage} from '../web/app/catalog-image-policy.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const catalog=read('catalog/catalog.json'),english=read('catalog/input/tomica-english.json'),media=read('catalog/input/catalog-images.json');
const overrides=read('catalog/input/catalog-image-overrides.json');for(const[id,patch]of Object.entries(overrides.images)){if(!media.images[id])throw new Error('Unknown photo override '+id);media.images[id]={...media.images[id],...patch};}
const supplemental=read('catalog/input/matchbox-2026-images.json');
for(const[id,image]of Object.entries(supplemental.images)){if(media.images[id])throw new Error('Supplemental photo replaces queued source '+id);media.images[id]=image;}
for(const[id,image]of Object.entries(releaseRefresh.images)){if(media.images[id])throw new Error('New photo replaces queued source '+id);media.images[id]=image;}
Object.assign(english.translations,Object.fromEntries(Object.entries(releaseRefresh.english).filter(([key])=>!english.translations[key])));
const expectedSizes=[500,500,500,500,200,250,300,140,425,500,200,846,93,31];
const batch=read('catalog/input/catalog-image-batch.json'),activeIds=new Set(batch.releaseIds);
if(batch.schema!==2||batch.limit!==4985||activeIds.size!==4985||batch.releaseIds.length!==4985||batch.batches?.length!==14)throw new Error('Expected fourteen reviewed photo batches including the 31-entry release refresh');
const batchedIds=batch.batches.flatMap((b,i)=>{if(b.limit!==expectedSizes[i]||b.releaseIds.length!==b.limit||!/^\d{4}-\d{2}-\d{2}-\d{3}$/.test(b.id))throw new Error('Invalid image batch');const archive=read('catalog/input/catalog-image-batches/'+b.id+'.json');if(i>=4&&i<13&&archive.brand!=='matchbox')throw new Error('Expected Matchbox photo batch');if(JSON.stringify(archive.releaseIds)!==JSON.stringify(b.releaseIds))throw new Error('Archived image batch differs');return b.releaseIds});
if(batchedIds.length!==new Set(batchedIds).size||JSON.stringify(batchedIds)!==JSON.stringify(batch.releaseIds))throw new Error('Image batches overlap or change prior order');
const rejected=read('catalog/input/catalog-image-rejections.json').rejectedHashes,releaseById=new Map(catalog.releases.map(r=>[r.id,r]));
const series=new Map(catalog.series.map(x=>[x.id,x.name])),ids=new Set(catalog.releases.map(r=>r.id)),translations={},images={};
const jp=/[\u3040-\u30ff\u3400-\u9fff]/u;
for(const r of catalog.releases){
 if(!r.brandId.startsWith('tomica'))continue;
 const fields={name:r.name,color:r.color,seriesName:series.get(r.seriesId)},entry={};let review=false;
 for(const [key,original]of Object.entries(fields)){
  const t=english.translations[original];if(original&&!t)throw new Error('Missing translation: '+original);
  if(t?.reviewRequired)throw new Error('Unreviewed English terminology: '+original);
  const value=t?.text||'';if(jp.test(value))throw new Error('Untranslated display text: '+value);
  entry[key]=value;entry['original'+key[0].toUpperCase()+key.slice(1)]=original;review ||=!!t?.reviewRequired;
 }
 entry.reviewRequired=review;translations[r.id]=entry;
}
for(const [id,image]of Object.entries(media.images)){
 if(!activeIds.has(id))continue;
 if(rejected[batch.verifiedAssets[image.url]?.sha256])throw new Error('Source placeholder cannot be published '+id);
 if(!batch.verifiedAssets[image.url]?.ok)throw new Error('Unverified batch photo '+id);
 if(!ids.has(id)||!allowedCatalogImage(image.url)||image.originalUrl&&!allowedCatalogImage(image.originalUrl)||image.fallbackUrl&&!allowedCatalogImage(image.fallbackUrl))throw new Error('Invalid image reference '+id);
 if(!['release-reference','casting-reference'].includes(image.kind)||image.referenceReleaseId&&!ids.has(image.referenceReleaseId))throw new Error('Invalid image match '+id);
 if(releaseRefresh.images[id]){
  const r=releaseById.get(id),proof=releaseRefresh.reviews[id],v=batch.verifiedAssets[image.url];
  if(!releaseRefresh.newReleaseIds.includes(id)||!proof||proof.visualReview!=='accepted'||image.kind!=='release-reference'||!r.sourceRefs.some(s=>s.url===image.sourceUrl)||v.width<500||v.height<300||!image.credit||r.brandId==='matchbox'&&!(v.thumbnailMeanError>=0&&v.thumbnailMeanError<=8))throw new Error('Invalid release refresh photo '+id);
 }
 if(supplemental.images[id]){
  const r=releaseById.get(id),proof=supplemental.reviews[id],v=batch.verifiedAssets[image.url];
  if(r.brandId!=='matchbox'||r.year!==2026||image.kind!=='release-reference'||!proof||proof.catalogName!==r.name||proof.sourceYear!==r.year||Number(proof.sourceNumber.split('/')[0])!==Number(r.collectorNumber.split('/')[0])||!proof.sourceNumber.endsWith('/125')||proof.sourceUrl!==image.sourceUrl||proof.url!==image.url||proof.sha256!==v.sha256||proof.sourceThumbnailUrl!==v.sourceThumbnailUrl||proof.photoType!==3||proof.visualReview!=='accepted'||!/^[a-f0-9]{64}$/.test(proof.sourcePageSha256)||!/^https:\/\/www\.matchboyz\.com\/matchbox-by-year\/2026\/basic\/[a-z0-9-]+_\d+\.html$/.test(image.sourceUrl)||!image.sourceUrl.endsWith('_'+proof.sourceRecordId+'.html')||!image.url.endsWith('_'+proof.photoId+'_3_'+proof.sourceRecordId+'.jpg')||v.width<500||v.height<300||!(v.thumbnailMeanError>=0&&v.thumbnailMeanError<=8)||!image.credit)throw new Error('Invalid reviewed 2026 photo provenance '+id);
 }
 if(image.kind==='casting-reference'){const reference=releaseById.get(image.referenceReleaseId);if(!reference||reference.castingId!==releaseById.get(id).castingId||!reference.sourceRefs.some(ref=>ref.url===image.sourceUrl))throw new Error('Invalid casting-photo provenance '+id);}
 const source=new URL(image.sourceUrl);if(source.protocol!=='https:')throw new Error('Invalid attribution link');
 images[id]={url:image.url,sourceUrl:image.sourceUrl,credit:image.credit,kind:image.kind,...(image.originalUrl?{originalUrl:image.originalUrl}:{}),...(image.fallbackUrl?{fallbackUrl:image.fallbackUrl}:{}),...(image.referenceReleaseId?{referenceReleaseId:image.referenceReleaseId}:{})};
}
if(Object.keys(images).length!==activeIds.size)throw new Error('Missing reviewed image references');
const result={schema:1,version:'2026.10.28.2',translations,images,counts:Object.fromEntries(catalog.brands.map(b=>[b.id,{total:catalog.releases.filter(r=>r.brandId===b.id).length,images:catalog.releases.filter(r=>r.brandId===b.id&&images[r.id]).length}])),batchId:batch.id};
writeFileSync('web/app/catalog/presentation-data.js','// Generated by npm run catalog:build; source facts and IDs are unchanged.\nexport default '+JSON.stringify(result)+';\n');
console.log(`Presentation: ${Object.keys(translations).length} English releases, ${Object.keys(images).length} image references.`);
