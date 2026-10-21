import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import bundled from '../web/app/catalog/pricing-data.js';
import data from '../web/app/catalog/data.js';
import {validatePrices,valuationQuote,marketQuote} from '../web/app/pricing-core.js';
import {quote,priceScope,priceSnapshot,syncPrices,usesPricing,unitValue,priceBusy,PRICE_URL} from '../web/app/pricing.js';
import {cleanItem,totals,validateBackup,filterItems} from '../web/app/domain.js';
import {prepareGarageItem} from '../web/app/garage.js';
import {priceBadges,catalogMarketPrice} from '../web/app/pricing-ui.js';
const now=Date.parse(bundled.prices.asOf),fx=bundled.prices.fx,baseMsrp=bundled.prices.msrp,age=new Date(now).getUTCFullYear()-2025,id=Object.keys(priceScope).find(id=>priceScope[id].productCode==='LV-N54d');
const copy=x=>structuredClone(x);
const sale=(n,amount=3000,condition='Boxed')=>({releaseId:id,productCode:'LV-N54d',sourceUrl:`https://www.ebay.com/itm/${400000000000+n}`,condition,amountCents:amount,currency:'USD',soldAt:new Date(now-18*86400000).toISOString().slice(0,10),observedAt:bundled.prices.asOf,verified:true,finalPriceKnown:true,lotSize:1,shippingExcluded:true,saleType:'auction'});
test('combined prices preserve TLV evidence and match reviewed exact Tomica source/title records',()=>{
 const tlv=JSON.parse(readFileSync('catalog/input/tlv-prices.json')),tomica=JSON.parse(readFileSync('catalog/input/tomica-prices.json')),built=validatePrices(bundled.prices,priceScope);
 assert.deepEqual(built,JSON.parse(readFileSync('web/app/catalog/prices.json')));assert.equal(Object.keys(built.msrp).length,2934);assert.equal(Object.keys(priceScope).length,4268);assert.equal(tlv.msrp[id].amount,3960);
 assert.deepEqual(Object.fromEntries(Object.entries(built.msrp).filter(([rid])=>priceScope[rid].brandId==='tomica-limited-vintage')),Object.fromEntries(Object.entries(tlv.msrp).map(([rid,m])=>[rid,baseMsrp[rid]])));assert.deepEqual(built.sales.slice(0,tlv.sales.length),tlv.sales);assert.deepEqual(built.sales.slice(tlv.sales.length),JSON.parse(readFileSync('catalog/input/price-sales-review.json')).sales);assert.deepEqual(built.fx,fx);
 assert.equal(Object.keys(tomica.msrp).length,1254);assert.deepEqual(tomica.conflicts,[]);
 for(const[rid,m]of Object.entries(built.msrp)){const r=data.releases.find(r=>r.id===rid);assert.ok(['tomica','tomica-limited-vintage'].includes(r.brandId));assert.ok(r.sourceRefs.some(s=>s.url===m.sourceUrl));assert.ok(m.amount>0);if(r.brandId==='tomica'){assert.equal(m.sourceUrl,tomica.msrp[rid].sourceUrl);assert.equal(m.amount,tomica.msrp[rid].amount);assert.match(tomica.evidence[rid].priceText,/メーカー希望小売価格/);assert.match(tomica.evidence[rid].sourceSha256,/^[a-f0-9]{64}$/)}}
 assert.equal(built.sales.length,3);assert.equal(marketQuote(built,built.sales[0].releaseId,'Sealed').amount,null);
});
test('adjusted MSRP basis compounds 10% per calendar year with dated JPY to USD conversion; only Tomica families',()=>{
 const q=valuationQuote({...bundled.prices,listings:[]},priceScope,id,'Boxed',now);assert.equal(q.kind,'msrp-rule');assert.equal(q.years,age);assert.equal(q.amount,Math.round(baseMsrp[id].amount*fx.usdPerEur/fx.jpyPerEur*1.085*1.10**age*100)/100);assert.equal(q.fxDate,fx.date);
 const next=valuationQuote({...bundled.prices,listings:[]},priceScope,id,'Boxed',Date.parse('2027-01-01'));assert.equal(next.years,2);assert.equal(next.amount,Math.round(baseMsrp[id].amount*fx.usdPerEur/fx.jpyPerEur*1.085*1.10**2*100)/100);
 assert.equal(valuationQuote(bundled.prices,priceScope,'hw-fake','Boxed',now).amount,null);
 const missing=Object.keys(priceScope).find(rid=>!bundled.prices.msrp[rid]);assert.equal(valuationQuote(bundled.prices,priceScope,missing,'Boxed',now).amount,null);
});
test('regular Tomica uses its own verified price and release year, with USD-only display',()=>{
 const rid=Object.keys(bundled.prices.msrp).find(rid=>priceScope[rid].brandId==='tomica'&&priceScope[rid].year===2025),m=bundled.prices.msrp[rid];
 assert.equal(valuationQuote(bundled.prices,priceScope,rid,'Boxed',now).amount,Math.round(m.amount*fx.usdPerEur/fx.jpyPerEur*1.085*1.10**age*100)/100);assert.match(priceBadges(rid),/USD/);assert.doesNotMatch(priceBadges(rid),/¥|JPY/);
 const p=copy(bundled.prices);p.msrp[rid].sourceUrl=p.msrp[id].sourceUrl;assert.throws(()=>validatePrices(p,priceScope,now));p.schema=1;assert.throws(()=>validatePrices(p,priceScope,now));
});
test('fallback establishes its base before annual growth, with a cent-safe minimum and no repeated application',()=>{
 const p={...copy(bundled.prices),sales:[],listings:[],fx:{...fx,usdPerEur:1,jpyPerEur:100}};
 p.msrp[id].amount=10000;
 const scope={...priceScope,[id]:{...priceScope[id],year:2026}},date=Date.parse('2026-10-21');
 assert.equal(valuationQuote(p,scope,id,'Boxed',date).amount,108.50);
 assert.equal(valuationQuote(p,scope,id,'Boxed',Date.parse('2027-01-01')).amount,119.35);
 assert.equal(valuationQuote(p,scope,id,'Boxed',Date.parse('2028-01-01')).amount,131.29);
 for(const condition of ['Boxed','Sealed','Loose'])assert.equal(valuationQuote(p,scope,id,condition,date).amount,108.50);
 assert.equal(p.msrp[id].amount,10000);
 p.msrp[id].amount=100;assert.equal(valuationQuote(p,scope,id,'Boxed',date).amount,1.09);
 // Every real fallback meets the minimum, while preserving raw conversion evidence.
 const withoutComparables={...bundled.prices,sales:[],listings:[]};
 for(const [rid,m]of Object.entries(baseMsrp)){
  const q=valuationQuote(withoutComparables,priceScope,rid,'Boxed',now);
  assert.equal(q.kind,'msrp-rule');assert.equal(q.baseUsd,m.amount*fx.usdPerEur/fx.jpyPerEur);
  assert.ok(q.amount>=q.baseUsd*1.085);
 }
});
test('supported market evidence below the fallback stays unchanged; insufficient or stale evidence uses the fallback',()=>{
 const p={...copy(bundled.prices),listings:[],sales:[sale(1,100),sale(2,200),sale(3,300)]};
 assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,2);
 p.sales.pop();const expected=valuationQuote({...p,sales:[]},priceScope,id,'Boxed',now).amount;
 assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,expected);
 p.sales=[];p.listings=[100,200,300].map((amountCents,n)=>({...sale(n,amountCents),active:true,sellerId:'seller'+n}));
 assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,2);
 p.listings=p.listings.map(x=>({...x,observedAt:new Date(now-31*86400000).toISOString()}));
 assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,2);
 p.listings=p.listings.map(x=>({...x,observedAt:new Date(now-181*86400000).toISOString()}));
 assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,expected);
});
test('sale averages take priority only with three recent distinct exact-condition observations; outliers excluded',()=>{
 const p=copy(bundled.prices);p.listings=[];p.sales=[sale(1,2000),sale(2,3000)];assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).kind,'msrp-rule');p.sales.push(sale(3,4000));assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,30);assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).kind,'sold-average');assert.equal(valuationQuote(p,priceScope,id,'Loose',now).kind,'msrp-rule');
 p.sales.push({...sale(4,90000),soldAt:'2025-01-01'});assert.equal(marketQuote(p,id,'Boxed',now).sampleCount,3);
 p.sales=[sale(1,3000),sale(2,3000),sale(3,3000),sale(4,3000),sale(5,90000)];const q=marketQuote(p,id,'Boxed',now);assert.equal(q.amount,30);assert.equal(q.excludedCount,1);assert.equal(q.sampleCount,4);
});
test('invalid/ambiguous evidence, duplicates, foreign IDs, hostile sources and invalid FX are rejected',()=>{
 for(const patch of [{finalPriceKnown:false},{verified:false},{lotSize:2},{currency:'JPY'},{amountCents:-1},{sourceUrl:'https://www.ebay.com.evil.test/itm/400000000001'},{productCode:'LV-N54c'},{soldAt:'2026-02-30'},{soldAt:new Date(now+2*86400000).toISOString().slice(0,10)}]){const p=copy(bundled.prices);p.sales=[{...sale(1),...patch}];assert.throws(()=>validatePrices(p,priceScope,now))}
 let p=copy(bundled.prices);p.sales=[sale(1),sale(1)];assert.throws(()=>validatePrices(p,priceScope,now));p=copy(bundled.prices);p.fx.jpyPerEur=0;assert.throws(()=>validatePrices(p,priceScope,now));p=copy(bundled.prices);p.msrp[id].sourceUrl='https://minicar.tomytec.co.jp/product/detail.html?id=1';assert.throws(()=>validatePrices(p,priceScope,now));
});
test('linked valuation updates totals, sort and copies without rewriting purchase costs or manual fallback; backups retain mode',()=>{
 const r=data.releases.find(r=>r.id===id),selected={name:r.name,brand:'Tomica Limited Vintage',catalogReleaseId:id,catalogCastingId:r.castingId};
 const x=prepareGarageItem({quantity:2,paid:10,value:17,valuationMode:'market',condition:'Boxed'},{selected});assert.equal(x.valuationMode,'market');assert.ok(usesPricing(x));assert.equal(totals([x]).value,quote(id).amount*2);assert.equal(x.value,17);assert.equal(x.paid,10);
 const backup=validateBackup({format:'tomitrack',schema:1,items:[x]}).items[0];assert.equal(backup.valuationMode,'market');assert.equal(backup.value,17);assert.equal(backup.paid,10);
 const manual=cleanItem({...x,id:'manual',valuationMode:'manual'});assert.equal(unitValue(manual),17);const legacy=cleanItem({...x,valuationMode:undefined});assert.equal(unitValue(legacy),17);assert.equal(totals([{...x,status:'wish'}]).value,0);assert.equal(filterItems([manual,x],{sort:'value'})[0].id,x.id);
 const foreign=cleanItem({...x,catalogReleaseId:'hw-fake'});assert.equal(foreign.valuationMode,'manual');assert.equal(prepareGarageItem({...x,quantity:3},{existing:x}).valuationMode,'market');
});
test('price badges describe fallback without exposing internal parameters, keep evidence hidden initially and omit other brands',()=>{const fallbackId=Object.keys(baseMsrp).find(rid=>!bundled.prices.listings.some(x=>x.releaseId===rid));const html=priceBadges(fallbackId);assert.match(html,/MSRP growth basis/);assert.ok(html.includes('MSRP <strong>'+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(baseMsrp[fallbackId].amount*fx.usdPerEur/fx.jpyPerEur)+'</strong>'));assert.doesNotMatch(html,/¥|JPY|3,960/);assert.match(html,/data-price-evidence="estimate" hidden/);assert.match(html,/10% annual growth/);assert.doesNotMatch(html,/8\.5|1\.085|Converted MSRP ×|<sup>/);assert.equal(priceBadges('hw-fake'),'')});
test('sync validates before activation, preserves prior snapshot on failure and never transmits collection data',async()=>{
 const before=priceSnapshot();let request;
 const candidate=copy(before);candidate.asOf=new Date(Date.parse(before.asOf)+1000).toISOString();candidate.msrp[id].amount+=100;
 const fetcher=async(url,options)=>{request={url,options};return {ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(candidate)}};
 await assert.rejects(syncPrices({fetcher,storage:{setItem(){throw Error('Disk full')}}}),/Disk full/);assert.equal(priceSnapshot(),before);assert.equal(priceBusy(),false);
 const stored=[];await syncPrices({fetcher,storage:{setItem:(...args)=>stored.push(args)}});assert.equal(request.url,PRICE_URL);assert.equal(request.options.credentials,'omit');assert.equal(request.options.body,undefined);assert.equal(stored.length,1);assert.equal(priceSnapshot().msrp[id].amount,candidate.msrp[id].amount);
 const current=priceSnapshot();await assert.rejects(syncPrices({fetcher:async()=>({ok:true,headers:{get:()=>null},text:async()=>'{bad'}),storage:{setItem(){}}}));assert.equal(priceSnapshot(),current);assert.equal(priceBusy(),false);
 await assert.rejects(syncPrices({fetcher:async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(before)}),storage:{setItem(){}}}),/older/);assert.equal(priceSnapshot(),current);
});

test('service worker never substitutes offline cached JSON for explicit price sync, while app offline access works',async()=>{
 const {runInNewContext}=await import('node:vm');const listeners={},cached=new Response('cached app');
 runInNewContext(readFileSync('web/app/sw.js','utf8'),{self:{addEventListener:(name,fn)=>listeners[name]=fn},location:{origin:'https://babycrttv.github.io'},URL,Response,fetch:()=>Promise.reject(Error('Offline')),caches:{match:async()=>cached}});
 let priceResponse;listeners.fetch({request:{method:'GET',url:PRICE_URL,cache:'no-store'},respondWith:r=>priceResponse=r});await assert.rejects(priceResponse,/Offline/);
 let appResponse;listeners.fetch({request:{method:'GET',url:'https://babycrttv.github.io/tomitrack/app/app.js',cache:'default'},respondWith:r=>appResponse=r});assert.equal(await appResponse,cached);
});

test('common listing logic applies to every priced model; sold evidence wins and repeated polls/sellers do not inflate averages',()=>{
 for(const rid of[id,Object.keys(priceScope).find(x=>priceScope[x].brandId==='tomica'&&baseMsrp[x])]){
  const p=copy(bundled.prices);p.listings=[10000,12000,14000].map((amountCents,n)=>({releaseId:rid,productCode:priceScope[rid].productCode,sourceUrl:`https://www.ebay.com/itm/${500000000000+n}`,condition:'Boxed',amountCents,currency:'USD',observedAt:new Date(now-86400000).toISOString(),verified:true,lotSize:1,active:true,sellerId:'ebay:seller'+n}));
  assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).amount,120);assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).kind,'listing-average');assert.equal(valuationQuote(p,priceScope,rid,'Sealed',now).amount,120);assert.notEqual(valuationQuote(p,priceScope,rid,'Loose',now).kind,'listing-average');
  p.listings.push({...p.listings[0],amountCents:99900,observedAt:new Date(now-2*86400000).toISOString()});p.listings.push({...p.listings[0],sourceUrl:'https://www.ebay.com/itm/500000000009'});assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).sampleCount,3);assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).amount,120);
  p.sales=[sale(1,2000),sale(2,3000),sale(3,4000)].map(s=>({...s,releaseId:rid,productCode:priceScope[rid].productCode}));assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).kind,'sold-average');assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).amount,30);
  p.sales=[];p.listings=p.listings.slice(0,3).map(x=>({...x,observedAt:new Date(now-31*86400000).toISOString()}));assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).kind,'historical-listing-average');p.listings=p.listings.map(x=>({...x,observedAt:new Date(now-181*86400000).toISOString()}));assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).kind,'msrp-rule');
 }
});
test('reviewed Porsche sample uses common logic and runtime values drive portfolio without supplier references in UI',()=>{
 const rid='tm-3f6d42ecd4b01b8d8440',seed=JSON.parse(readFileSync('catalog/input/price-listings.json'));seed.observations=seed.observations.filter(x=>x.releaseId===rid);const q=valuationQuote({...bundled.prices,listings:seed.observations},priceScope,rid,'Boxed',Date.parse(seed.asOf));assert.equal(q.kind,'listing-average');assert.ok(q.sampleCount>=3);assert.ok(q.amount>=Math.min(...seed.observations.map(x=>x.amountCents))/100);assert.ok(q.amount<=Math.max(...seed.observations.map(x=>x.amountCents))/100);
 const html=priceBadges(rid);assert.match(html,/actual selling prices can vary/);assert.match(html,/Market Price <strong>/);assert.doesNotMatch(html,/<small>|TomiKing pricing|Japan MSRP|USD conversion/);assert.doesNotMatch(html,/Est\. market|MSRP-based estimate|<a\b|ebay|mercari|sellerId|Rate source|Manufacturer price source/i);assert.doesNotMatch(html,/¥|JPY/);
 const item=cleanItem({name:'Yellow Porsche',catalogReleaseId:rid,condition:'Boxed',quantity:2,paid:20,value:40,valuationMode:'market'});assert.equal(totals([item]).value,quote(rid,'Boxed').amount*2);assert.equal(item.paid,20);assert.equal(item.value,40);
});
test('listing validator rejects mismatched variants, hostile sources, duplicate observations and ambiguous lots',()=>{
 const original=bundled.prices.listings[0];for(const patch of[{sourceUrl:'https://www.ebay.com.evil.test/itm/127990132249'},{releaseId:'hw-fake'},{productCode:'LV-86a'},{currency:'JPY'},{lotSize:2},{verified:false},{sellerId:''},{active:'true'}]){const p=copy(bundled.prices);p.listings=[{...original,...patch}];assert.throws(()=>validatePrices(p,priceScope,now))}
 const p=copy(bundled.prices);p.listings=[original,original];assert.throws(()=>validatePrices(p,priceScope,now));
});

test('ended checks do not rejuvenate stale asking prices or override newer seller prices',()=>{
 const rid='tm-3f6d42ecd4b01b8d8440',seed=JSON.parse(readFileSync('catalog/input/price-listings.json')).observations.filter(x=>x.releaseId===rid),p=copy(bundled.prices);
 p.listings=seed.map(x=>({...x,active:false,observedAt:new Date(now-86400000).toISOString(),priceObservedAt:new Date(now-181*86400000).toISOString()}));
 assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).kind,'msrp-rule');
 p.listings=p.listings.map(x=>({...x,priceObservedAt:new Date(now-31*86400000).toISOString()}));assert.equal(valuationQuote(p,priceScope,rid,'Boxed',now).kind,'historical-listing-average');
 assert.throws(()=>validatePrices({...p,listings:[{...p.listings[0],priceObservedAt:new Date(now+86400000).toISOString()}]},priceScope,now));
});

test('catalog price stays on the boxed reference even if loose copies have supported sales',async(t)=>{
 const before=priceSnapshot(),p=copy(before),rid='tm-3f6d42ecd4b01b8d8440';
 t.mock.method(Date,'now',()=>Date.parse(before.asOf));
 p.listings=JSON.parse(readFileSync('catalog/input/price-listings.json')).observations.map(x=>({...x,observedAt:before.asOf}));
 p.sales=[1,2,3].map(n=>({...sale(100+n,100000,'Loose'),releaseId:rid,productCode:priceScope[rid].productCode}));
 const activate=prices=>syncPrices({fetcher:async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(prices)}),storage:{setItem(){}}});
 try{await activate(p);assert.equal(quote(rid,'Loose').amount,1000);const boxed=quote(rid,'Boxed').amount;assert.notEqual(boxed,1000);const amount='$'+boxed.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});assert.ok(catalogMarketPrice(rid).includes(amount));assert.ok(priceBadges(rid).includes('Market Price <strong>'+amount))}finally{await activate(before)}
 const seed=JSON.parse(readFileSync('catalog/input/price-listings.json'));
 const codes=['LV-86b','LV-86h','LV-110c','LV-N305d','LV-N305e','LV-N54d'];const ids=[...new Set(seed.observations.map(x=>x.releaseId))].filter(rid=>codes.includes(priceScope[rid].productCode));assert.equal(ids.length,6);
 for(const rid of ids){const q=valuationQuote({...bundled.prices,listings:seed.observations},priceScope,rid,'Boxed',Date.parse(seed.asOf));assert.equal(q.kind,'listing-average');assert.ok(q.sampleCount>=3);const comparable=seed.observations.filter(x=>x.releaseId===rid);assert.ok(q.amount>=Math.min(...comparable.map(x=>x.amountCents))/100);assert.ok(q.amount<=Math.max(...comparable.map(x=>x.amountCents))/100)}
});
