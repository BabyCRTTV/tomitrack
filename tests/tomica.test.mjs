import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import dataset from '../web/app/catalog/data.js';
import {createCatalog,catalogItem,canonicalGtin} from '../web/app/catalog.js';
import {cleanItem,validateBackup} from '../web/app/domain.js';
const engine=createCatalog(dataset);
const report=JSON.parse(readFileSync('catalog/input/tomica-fetch-report.json'));
test('Tomica integration preserves all 13,652 recovered Mattel releases byte for byte',()=>{
 const rows=dataset.releases.filter(r=>['hot-wheels','matchbox'].includes(r.brandId));
 assert.equal(rows.length,13652);
 assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'),'699ea76a0b957cf24e1b5af58496b0539d2cccbe0b4d666f3ae37dfdd49950d5');
});
test('Japanese and English queries find historical editions without losing Japanese names',()=>{
 const old=engine.search({query:'Bluebird',brandId:'tomica',year:1970});
 assert.ok(old.items.some(x=>x.release.productCode==='1-1'&&x.release.originalName.includes('ブルーバード')&&x.release.name.includes('Bluebird')));
 assert.ok(engine.search({query:'トヨタ',brandId:'tomica'}).total>100);
 assert.equal(engine.search({query:'存在しない車両XYZ'}).total,0);
 for(const categoryId of ['mainline','foreign','premium','dream','exclusive','vintage','vintage-neo'])assert.ok(engine.search({categoryId}).total>0);
});
test('official JAN links retain toy release year, variant code, scale and private-copy metadata',()=>{
 const r=engine.releases.find(x=>x.sourceRefs.some(ref=>ref.url==='https://minicar.tomytec.co.jp/product/detail.html?id=1108'));
 assert.ok(r);assert.equal(r.year,2004);assert.equal(r.scale,'1:64');assert.equal(r.productCode,'LV-01a');
 const jan=dataset.identifiers.find(x=>x.releaseIds?.includes(r.id));assert.ok(canonicalGtin(jan.value));
 const found=engine.search({query:jan.value});assert.ok(found.items.some(x=>x.release.id===r.id));assert.equal(found.barcode.shared,false);
 const owned=cleanItem({...catalogItem(r),upc:jan.value,color:'My inspected variant',notes:'Shelf A',quantity:2});
 const restored=validateBackup({format:'tomitrack',schema:1,items:[owned]}).items[0];
 assert.equal(restored.catalogReleaseId,r.id);assert.equal(restored.scale,'1:64');assert.equal(restored.color,'My inspected variant');assert.equal(restored.releaseYear,'2004');
 assert.ok(engine.search({query:'Cedric',brandId:'tomica-limited-vintage'}).items.some(x=>x.release.originalName.includes('セドリック')&&x.release.name.includes('Cedric')));
 const truck=engine.releases.find(x=>x.name.startsWith('LV-N43-26a '));assert.equal(truck?.productCode,'LV-N43-26a');
});
test('unknown dates, unavailable archives and future announcements remain explicit research gaps',()=>{
 assert.ok(report.undatedProducts.length>100);assert.equal(report.unavailableMonthlyPages.length,72);
 assert.ok(report.futureListingsExcluded.length>50);
 assert.ok(dataset.researchGaps.tomica.notes.some(x=>x.includes('Tomica Limited')));
 for(const r of engine.releases.filter(x=>x.brandId.startsWith('tomica'))){assert.ok(r.year>=1970&&r.year<=2026);if(r.releaseDate){assert.ok(r.releaseDate<='2026-10-16');assert.notEqual(r.releaseDate,'2026-10')}}
 assert.ok(!engine.releases.some(x=>x.name.includes('デリカミニ')&&x.sourceRefs.some(ref=>ref.url?.endsWith('/2610.htm'))));
 const sources=JSON.parse(readFileSync('catalog/input/tomica-sources.json'));assert.ok(sources.length>80);assert.ok(sources.every(x=>/^[a-f0-9]{64}$/.test(x.sha256)));
});
test('SQLite full text search includes English aliases and retains new public metadata',()=>{
 const folder=mkdtempSync(path.join(tmpdir(),'tomitrack-tomica-'));
 try{const output=path.join(folder,'catalog.sqlite');execFileSync('python3',['scripts/build-catalog-db.py','--output',output]);
 execFileSync('python3',['-c',`import sqlite3,sys
c=sqlite3.connect(sys.argv[1]);assert c.execute("select count(*) from release_search where release_search match 'Cedric'").fetchone()[0]>10
assert c.execute("select count(*) from releases where brand_id='tomica-limited-vintage' and scale='1:64' and release_date like '2004-%'").fetchone()[0]>0
assert c.execute("select count(*) from release_search where release_search match '日産'").fetchone()[0]>10
assert c.execute('pragma integrity_check').fetchone()[0]=='ok';assert not c.execute('pragma foreign_key_check').fetchall()`,output]);
 }finally{rmSync(folder,{recursive:true,force:true})}
});
