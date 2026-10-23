import {createHash}from 'node:crypto';import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync}from 'node:fs';
import data from '../web/app/catalog/data.js';import {createCatalog,catalogItem}from '../web/app/catalog.js';import {cleanItem}from '../web/app/domain.js';
import {presentation,displayName,displayColor,displaySeries,photoMarkup,catalogPhoto,installPhotoFallbacks}from '../web/app/catalog-presentation.js';import {allowedCatalogImage}from '../web/app/catalog-image-policy.js';
const catalog=createCatalog(data),jp=/[\u3040-\u30ff\u3400-\u9fff]/u;
test('all 4268 Tomica-family identities have English names and metadata with Japanese discovery retained',()=>{const original=new Map(data.releases.map(r=>[r.id,r]));const rows=catalog.releases.filter(r=>r.brandId.startsWith('tomica'));assert.equal(rows.length,4268);for(const r of rows){assert.equal(r.reviewRequired,false,r.id);assert.equal(jp.test([r.name,r.color,r.seriesName].join(' ')),false,r.id);assert.equal(r.originalName,original.get(r.id).name);assert.equal(cleanItem(catalogItem(r)).name,r.name);}const audi=rows.find(r=>r.productCode==='LV-N86a');assert.match(audi.name,/Audi\s*80\s*quattro.*Gray/i);assert.ok(catalog.search({query:'アウディ80 クワトロ'}).items.some(x=>x.release.id===audi.id));assert.match(rows.find(r=>r.originalName.includes('サンバー ライトバン(ブリヂストン)')).name,/Subaru Sambar Light Van.*Bridgestone/);assert.ok(rows.some(r=>r.name.includes('Gudetama')));assert.equal(JSON.parse(readFileSync('catalog/input/tomica-translation-review.json')).remainingTerms,0);});
test('English series options filter the same displayed series and brand navigation retains its scope',()=>{for(const brandId of ['tomica','tomica-limited-vintage'])for(const s of catalog.seriesOptions({brandId})){assert.equal(jp.test(s.name),false);assert.ok(catalog.search({brandId,seriesName:s.name}).total>0);}});
test('saved Japanese snapshots display English without altering private data or custom collector fields',()=>{const r=catalog.releases.find(r=>r.productCode==='LV-N86a'),item={...catalogItem(r),name:r.originalName,color:r.originalColor,series:r.originalSeriesName};const before=JSON.stringify(item);assert.equal(displayName(item),r.name);assert.equal(displayColor(item),r.color);assert.equal(displaySeries(item),r.seriesName);assert.equal(JSON.stringify(item),before);assert.equal(displayName({...item,name:'My inspected model'}),'My inspected model');assert.equal(displayColor({...item,color:'Custom repaint'}),'Custom repaint');});
test('ambiguous Gear accessory and Spacia terms stay separate from the Mustang Ghia trim',()=>{const terms=new Map(JSON.parse(readFileSync('catalog/input/tomica-english-glossary.json')).terms);assert.equal(terms.get('ギア'),'Gear');assert.equal(terms.get('ムスタングII ギア'),'Mustang II Ghia');for(const r of catalog.releases.filter(r=>r.originalName?.includes('スペーシア ギア')))assert.match(r.name,/Spacia Gear/);});
test('four 500-entry batches and six Matchbox batches ship without replacing prior photos; remaining candidates stay queued',()=>{const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json'));assert.equal(Object.keys(presentation.images).length,3815);assert.equal(batch.limit,3815);assert.equal(batch.batches.length,10);assert.equal(new Set(batch.releaseIds).size,3815);assert.deepEqual(batch.batches.flatMap(b=>b.releaseIds),batch.releaseIds);for(const[i,b]of batch.batches.entries()){assert.equal(b.releaseIds.length,[500,500,500,500,200,250,300,140,425,500][i]);assert.equal(b.limit,b.releaseIds.length)}const archived=readFileSync('catalog/input/catalog-image-batches/2026-10-17-001.json');assert.equal(createHash('sha256').update(archived).digest('hex'),'ac456af7d22786de89a2538c8825c15f2c486b00d2f9f693bbb2ab4fab8b1f85');const previous=JSON.parse(archived);assert.deepEqual(batch.releaseIds.slice(0,500),previous.releaseIds);const originalIds=new Set(previous.releaseIds),retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>originalIds.has(id)));assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'1c470aa8eddc1731a3ac70cd9e03f967173cbc047a0a2a2be05152323ad4b4c8');for(const[url,verification]of Object.entries(previous.verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],verification);for(const id of batch.releaseIds.slice(500)){const image=presentation.images[id],v=batch.verifiedAssets[image.url];assert.ok(v.width>=500&&v.height>=300,id)}assert.deepEqual(new Set(Object.keys(presentation.images)),new Set(batch.releaseIds));const ids=new Set(data.releases.map(r=>r.id));for(const[id,p]of Object.entries(presentation.images)){assert.ok(ids.has(id));assert.ok(allowedCatalogImage(p.url));assert.ok(batch.verifiedAssets[p.url]?.ok);assert.notEqual(batch.verifiedAssets[p.url].sha256,'43369f71bf52260cd960b10d362dc9897fa7985b45861af1b5d6abd114ee97cf');assert.ok(p.sourceUrl.startsWith('https://'));if(batch.releaseIds.indexOf(id)>=500){const original=data.releases.find(r=>r.id===id),source=p.kind==='casting-reference'?data.releases.find(r=>r.id===p.referenceReleaseId):original;assert.equal(source.castingId,original.castingId);assert.ok(source.sourceRefs.some(ref=>ref.url===p.sourceUrl));}}assert.ok(Object.keys(JSON.parse(readFileSync('catalog/input/catalog-images.json')).images).length>15000);});
test('source image endpoints reject unrelated network URLs and credentials',()=>{for(const u of ['http://www.bamca.org/pic/man/a.jpg','https://www.bamca.org.evil.test/pic/man/a.jpg','https://user@www.bamca.org/pic/man/a.jpg','https://www.bamca.org:8443/pic/man/a.jpg','https://www.bamca.org/cgi-bin/single.cgi','https://minicar.tomytec.co.jp/common/api/image.php?jancode=4543736340195&num=1&redirect=https://evil.test','javascript:alert(1)','https://www.takaratomy.co.jp/products/tomica/new/images/%2e%2e/a.jpg'])assert.equal(allowedCatalogImage(u),false,u);});
test('source errors try a validated listed fallback once, then expose a readable placeholder',()=>{let listener;installPhotoFallbacks({addEventListener:(_,fn)=>listener=fn});const seen=[],frame={classList:{add:v=>seen.push(v)}},image={tagName:'IMG',dataset:{photoFallback:'https://www.bamca.org/pic/man/var/s_mb736-04.jpg'},closest:()=>frame};listener({target:image});assert.equal(image.dataset.photoFallback,undefined);assert.ok(image.src.endsWith('s_mb736-04.jpg'));listener({target:image});assert.deepEqual(seen,['photo-failed']);const missing=catalog.releases.find(r=>!catalogPhoto(r.id));assert.match(photoMarkup(missing),/Photo pending/);assert.doesNotMatch(photoMarkup({id:'missing',name:'<img src=x onerror=alert(1)>'}),/<img/);});

test('Matchbox batch preserves the complete published 2000-photo subset and verification evidence',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),raw=readFileSync('catalog/input/catalog-image-batches/2026-10-18-002.json');
 assert.equal(createHash('sha256').update(raw).digest('hex'),'61ab34d306376a768e5f16f835a38a51a27ab2b12f1d578f15b94722f6fb8ac9');
 const third=readFileSync('catalog/input/catalog-image-batches/2026-10-18-003.json');assert.equal(createHash('sha256').update(third).digest('hex'),'eca434aa047b95011351661ec7c7bf9b1c9cd0ee133c3f8feb98264c87957b1c');
 const fourth=readFileSync('catalog/input/catalog-image-batches/2026-10-18-004.json');assert.equal(createHash('sha256').update(fourth).digest('hex'),'ef1b5b94edc08894aa17e6722d87a4692d0556b105d2938d1fa3d5cf4214837e');
 const archives=[JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-17-001.json')),JSON.parse(raw),JSON.parse(third),JSON.parse(fourth)],ids=archives.flatMap(b=>b.releaseIds),oldIds=new Set(ids);
 assert.deepEqual(batch.releaseIds.slice(0,2000),ids);
 const retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>oldIds.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'2cc3ee379e5316be159703570db933aa7d30a198180c9b08ac564407eafa4d4f');
 for(const archive of archives)for(const[url,verification]of Object.entries(archive.verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],verification);
});

test('Matchbox batches add exactly 1815 high-resolution variant photos and keeps cited thumbnail evidence',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),ids=batch.releaseIds.slice(2000),overrides=JSON.parse(readFileSync('catalog/input/catalog-image-overrides.json')).images,original=JSON.parse(readFileSync('catalog/input/catalog-images.json')).images;
 assert.equal(ids.length,1815);assert.deepEqual(new Set(Object.keys(overrides)),new Set(ids));assert.equal(presentation.counts.matchbox.images,1815);
 for(const id of ids){const r=data.releases.find(r=>r.id===id),photo=presentation.images[id],v=batch.verifiedAssets[photo.url];assert.equal(r.brandId,'matchbox');assert.equal(photo.kind,'release-reference');assert.equal(photo.sourceUrl,original[id].sourceUrl);assert.equal(photo.url,original[id].url.replace('/s_','/l_'));assert.ok(allowedCatalogImage(photo.url));assert.equal(v.sourceThumbnailUrl,original[id].url);assert.ok(v.thumbnailMeanError>=0&&v.thumbnailMeanError<=8);assert.ok(v.width>=500&&v.height>=300);}
});

test('new 250-entry Matchbox batch preserves all published 2200 photos and the first Matchbox archive',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),previous=JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-18-005.json'));
 assert.equal(createHash('sha256').update(readFileSync('catalog/input/catalog-image-batches/2026-10-18-005.json')).digest('hex'),'622c26c8613662fd452b31bf034002abdb6433bb0879780287d8d18de084515b');
 assert.deepEqual(batch.releaseIds.slice(2000,2200),previous.releaseIds);
 const oldIds=new Set(batch.releaseIds.slice(0,2200)),retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>oldIds.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'f7930a0293c9e32fa82dd4cccfe68517b51153519da645463d13394c51eaae0a');
 for(const[url,proof]of Object.entries(previous.verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],proof);
 const latest=JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-18-006.json'));assert.equal(latest.brand,'matchbox');assert.equal(latest.limit,250);assert.deepEqual(latest.releaseIds,batch.releaseIds.slice(2200,2450));assert.equal(latest.releaseIds.length,250);assert.ok(latest.releaseIds.every(id=>!oldIds.has(id)));
});


test('300 new Matchbox photos preserve all 2450 published references and use distinct additional sources',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),latest=JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-23-007.json'));
 assert.equal(createHash('sha256').update(readFileSync('catalog/input/catalog-image-batches/2026-10-18-006.json')).digest('hex'),'9392179fd99f46888e50714cc3e7c16aee1395a29c6cb9adbdfe3fb2a804b37a');
 const oldIds=new Set(batch.releaseIds.slice(0,2450)),retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>oldIds.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'9dfabe273103de520a53990b81b74130a8da2c84e77704e34a502f99e3dd50ae');
 assert.equal(latest.brand,'matchbox');assert.equal(latest.limit,300);assert.deepEqual(latest.releaseIds,batch.releaseIds.slice(2450,2750));
 const oldUrls=new Set(Object.values(retained).map(p=>p.url)),newUrls=latest.releaseIds.map(id=>presentation.images[id].url);
 assert.equal(new Set(newUrls).size,300);assert.ok(newUrls.every(url=>!oldUrls.has(url)));
 for(const archive of batch.batches.slice(0,6))for(const[url,proof]of Object.entries(JSON.parse(readFileSync('catalog/input/catalog-image-batches/'+archive.id+'.json')).verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],proof);
});


test('140 additional Matchbox photos preserve every published photo and use distinct new source content',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),latest=JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-23-008.json'));
 assert.equal(createHash('sha256').update(readFileSync('catalog/input/catalog-image-batches/2026-10-23-007.json')).digest('hex'),'dd98793683d6d799c70c1001f4ec306097fc5e3fba15c0b913817d94bf30d1ba');
 const oldIds=new Set(batch.releaseIds.slice(0,2750)),retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>oldIds.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'d0e62ae47e6cceeb6e3d92fc1d2e93aace62e344b7ad6048db58164e9edaf800');
 assert.equal(latest.brand,'matchbox');assert.equal(latest.limit,140);assert.deepEqual(latest.releaseIds,batch.releaseIds.slice(2750,2890));
 const oldUrls=new Set(Object.values(retained).map(p=>p.url)),oldHashes=new Set([...oldUrls].map(url=>batch.verifiedAssets[url].sha256)),newUrls=latest.releaseIds.map(id=>presentation.images[id].url),proofs=Object.values(latest.verifiedAssets);
 assert.equal(new Set(newUrls).size,140);assert.ok(newUrls.every(url=>!oldUrls.has(url)));assert.equal(new Set(proofs.map(v=>v.sha256)).size,140);assert.ok(proofs.every(v=>!oldHashes.has(v.sha256)));
 for(const archive of batch.batches.slice(0,7))for(const[url,proof]of Object.entries(JSON.parse(readFileSync('catalog/input/catalog-image-batches/'+archive.id+'.json')).verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],proof);
});


test('425 additional Matchbox photos preserve every published photo and add distinct new sources',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),latest=JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-23-009.json'));
 assert.equal(createHash('sha256').update(readFileSync('catalog/input/catalog-image-batches/2026-10-23-008.json')).digest('hex'),'c45a70bd7c2a2a591242b6b0f89c47001bceb2aae4f27bb58a5ff986ad8584b7');
 const oldIds=new Set(batch.releaseIds.slice(0,2890)),retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>oldIds.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'f13a74ac3b04345e8fa0d26c2bd8f9b415b513c94e0ea27d0e2760dbe3d515bd');
 assert.equal(latest.brand,'matchbox');assert.equal(latest.limit,425);assert.deepEqual(latest.releaseIds,batch.releaseIds.slice(2890,3315));
 const oldUrls=new Set(Object.values(retained).map(p=>p.url)),oldHashes=new Set([...oldUrls].map(url=>batch.verifiedAssets[url].sha256)),newUrls=latest.releaseIds.map(id=>presentation.images[id].url),proofs=Object.values(latest.verifiedAssets);
 assert.equal(new Set(newUrls).size,425);assert.ok(newUrls.every(url=>!oldUrls.has(url)));assert.equal(new Set(proofs.map(v=>v.sha256)).size,425);assert.ok(proofs.every(v=>!oldHashes.has(v.sha256)));
 for(const archive of batch.batches.slice(0,8))for(const[url,proof]of Object.entries(JSON.parse(readFileSync('catalog/input/catalog-image-batches/'+archive.id+'.json')).verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],proof);
});


test('500 additional Matchbox photos preserve all prior entries and add distinct new sources',()=>{
 const batch=JSON.parse(readFileSync('catalog/input/catalog-image-batch.json')),latest=JSON.parse(readFileSync('catalog/input/catalog-image-batches/2026-10-23-010.json'));
 assert.equal(createHash('sha256').update(readFileSync('catalog/input/catalog-image-batches/2026-10-23-009.json')).digest('hex'),'f943643f580e56726ac4783b9f17e36da083c1d5c16246d6c1bbc19904b9c659');
 const oldIds=new Set(batch.releaseIds.slice(0,3315)),retained=Object.fromEntries(Object.entries(presentation.images).filter(([id])=>oldIds.has(id)));
 assert.equal(createHash('sha256').update(JSON.stringify(retained)).digest('hex'),'5c151a7fd3394f040c2dfd44f7459ca5ba2f0d13cb6a2d1a0786415e662fa984');
 assert.equal(latest.brand,'matchbox');assert.equal(latest.limit,500);assert.deepEqual(latest.releaseIds,batch.releaseIds.slice(3315));
 const oldUrls=new Set(Object.values(retained).map(p=>p.url)),oldHashes=new Set([...oldUrls].map(url=>batch.verifiedAssets[url].sha256)),newUrls=latest.releaseIds.map(id=>presentation.images[id].url),proofs=Object.values(latest.verifiedAssets);
 assert.equal(new Set(newUrls).size,500);assert.ok(newUrls.every(url=>!oldUrls.has(url)));assert.equal(new Set(proofs.map(v=>v.sha256)).size,500);assert.ok(proofs.every(v=>!oldHashes.has(v.sha256)));
 for(const archive of batch.batches.slice(0,9))for(const[url,proof]of Object.entries(JSON.parse(readFileSync('catalog/input/catalog-image-batches/'+archive.id+'.json')).verifiedAssets))assert.deepEqual(batch.verifiedAssets[url],proof);
});
