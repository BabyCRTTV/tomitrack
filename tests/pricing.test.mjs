import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
import bundled from '../web/app/catalog/pricing-data.js';
import data from '../web/app/catalog/data.js';
import {validatePrices,valuationQuote,marketQuote} from '../web/app/pricing-core.js';
import {quote,priceScope,priceSnapshot,syncPrices,usesPricing,unitValue,priceBusy,PRICE_URL} from '../web/app/pricing.js';
import {cleanItem,totals,validateBackup,filterItems} from '../web/app/domain.js';
import {prepareGarageItem} from '../web/app/garage.js';
import {priceBadges} from '../web/app/pricing-ui.js';
const now=Date.parse('2026-10-19T00:00:00Z'),id=Object.keys(priceScope).find(id=>priceScope[id].productCode==='LV-N54d');
const copy=x=>structuredClone(x);
const sale=(n,amount=3000,condition='Boxed')=>({releaseId:id,productCode:'LV-N54d',sourceUrl:`https://www.ebay.com/itm/${400000000000+n}`,condition,amountCents:amount,currency:'USD',soldAt:'2026-10-01',observedAt:'2026-10-18T18:00:00Z',verified:true,finalPriceKnown:true,lotSize:1,shippingExcluded:true,saleType:'auction'});
test('all imported MSRPs match exact TLV sources; generated public snapshot matches reviewed input',()=>{
 const raw=JSON.parse(readFileSync('catalog/input/tlv-prices.json')),built=validatePrices(raw,priceScope);
 assert.deepEqual(built,bundled.prices);assert.deepEqual(built,JSON.parse(readFileSync('web/app/catalog/prices.json')));assert.equal(Object.keys(built.msrp).length,1680);assert.equal(Object.keys(priceScope).length,1684);assert.equal(built.msrp[id].amount,3960);
 for(const[rid,m]of Object.entries(built.msrp)){const r=data.releases.find(r=>r.id===rid);assert.equal(r.brandId,'tomica-limited-vintage');assert.ok(r.sourceRefs.some(s=>s.url===m.sourceUrl));assert.ok(m.amount>0)}
 assert.equal(built.sales.length,1);assert.equal(marketQuote(built,built.sales[0].releaseId,'Sealed').amount,null);
});
test('owner MSRP rule compounds 10% per calendar year with dated JPY to USD conversion; no other brands',()=>{
 const q=valuationQuote(bundled.prices,priceScope,id,'Boxed',now);assert.equal(q.kind,'msrp-rule');assert.equal(q.years,1);assert.equal(q.amount,Math.round(3960*1.1253/177.82*1.1*100)/100);assert.equal(q.fxDate,'2026-10-16');
 const next=valuationQuote(bundled.prices,priceScope,id,'Boxed',Date.parse('2027-01-01'));assert.equal(next.years,2);assert.equal(next.amount,Math.round(3960*1.1253/177.82*1.1**2*100)/100);
 assert.equal(valuationQuote(bundled.prices,priceScope,'hw-fake','Boxed',now).amount,null);
 const missing=Object.keys(priceScope).find(rid=>!bundled.prices.msrp[rid]);assert.equal(valuationQuote(bundled.prices,priceScope,missing,'Boxed',now).amount,null);
});
test('sale averages take priority only with three recent distinct exact-condition observations; outliers excluded',()=>{
 const p=copy(bundled.prices);p.sales=[sale(1,2000),sale(2,3000)];assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).kind,'msrp-rule');p.sales.push(sale(3,4000));assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).amount,30);assert.equal(valuationQuote(p,priceScope,id,'Boxed',now).kind,'sold-average');assert.equal(valuationQuote(p,priceScope,id,'Loose',now).kind,'msrp-rule');
 p.sales.push({...sale(4,90000),soldAt:'2025-01-01'});assert.equal(marketQuote(p,id,'Boxed',now).sampleCount,3);
 p.sales=[sale(1,3000),sale(2,3000),sale(3,3000),sale(4,3000),sale(5,90000)];const q=marketQuote(p,id,'Boxed',now);assert.equal(q.amount,30);assert.equal(q.excludedCount,1);assert.equal(q.sampleCount,4);
});
test('invalid/ambiguous evidence, duplicates, foreign IDs, hostile sources and invalid FX are rejected',()=>{
 for(const patch of [{finalPriceKnown:false},{verified:false},{lotSize:2},{currency:'JPY'},{amountCents:-1},{sourceUrl:'https://www.ebay.com.evil.test/itm/400000000001'},{productCode:'LV-N54c'},{soldAt:'2026-02-30'},{soldAt:'2030-01-01'}]){const p=copy(bundled.prices);p.sales=[{...sale(1),...patch}];assert.throws(()=>validatePrices(p,priceScope,now))}
 let p=copy(bundled.prices);p.sales=[sale(1),sale(1)];assert.throws(()=>validatePrices(p,priceScope,now));p=copy(bundled.prices);p.fx.jpyPerEur=0;assert.throws(()=>validatePrices(p,priceScope,now));p=copy(bundled.prices);p.msrp[id].sourceUrl='https://minicar.tomytec.co.jp/product/detail.html?id=1';assert.throws(()=>validatePrices(p,priceScope,now));
});
test('linked valuation updates totals, sort and copies without rewriting purchase costs or manual fallback; backups retain mode',()=>{
 const r=data.releases.find(r=>r.id===id),selected={name:r.name,brand:'Tomica Limited Vintage',catalogReleaseId:id,catalogCastingId:r.castingId};
 const x=prepareGarageItem({quantity:2,paid:10,value:17,valuationMode:'market',condition:'Boxed'},{selected});assert.equal(x.valuationMode,'market');assert.ok(usesPricing(x));assert.equal(totals([x]).value,quote(id).amount*2);assert.equal(x.value,17);assert.equal(x.paid,10);
 const backup=validateBackup({format:'tomitrack',schema:1,items:[x]}).items[0];assert.equal(backup.valuationMode,'market');assert.equal(backup.value,17);assert.equal(backup.paid,10);
 const manual=cleanItem({...x,id:'manual',valuationMode:'manual'});assert.equal(unitValue(manual),17);const legacy=cleanItem({...x,valuationMode:undefined});assert.equal(unitValue(legacy),17);assert.equal(totals([{...x,status:'wish'}]).value,0);assert.equal(filterItems([manual,x],{sort:'value'})[0].id,x.id);
 const foreign=cleanItem({...x,catalogReleaseId:'hw-fake'});assert.equal(foreign.valuationMode,'manual');assert.equal(prepareGarageItem({...x,quantity:3},{existing:x}).valuationMode,'market');
});
test('price badges identify formula estimates, keep evidence hidden initially and omit other brands',()=>{const html=priceBadges(id);assert.match(html,/MSRP-based estimate/);assert.match(html,/¥3,960/);assert.match(html,/data-price-evidence="estimate" hidden/);assert.match(html,/1.10/);assert.equal(priceBadges('hw-fake'),'')});
test('sync validates before activation, preserves prior snapshot on failure and never transmits collection data',async()=>{
 const before=priceSnapshot();let request;
 const candidate=copy(before);candidate.asOf=new Date(Date.parse(before.asOf)+1000).toISOString();candidate.msrp[id].amount+=100;
 const fetcher=async(url,options)=>{request={url,options};return {ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(candidate)}};
 await assert.rejects(syncPrices({fetcher,storage:{setItem(){throw Error('Disk full')}}}),/Disk full/);assert.equal(priceSnapshot(),before);assert.equal(priceBusy(),false);
 const stored=[];await syncPrices({fetcher,storage:{setItem:(...args)=>stored.push(args)}});assert.equal(request.url,PRICE_URL);assert.equal(request.options.credentials,'omit');assert.equal(request.options.body,undefined);assert.equal(stored.length,1);assert.equal(priceSnapshot().msrp[id].amount,candidate.msrp[id].amount);
 const current=priceSnapshot();await assert.rejects(syncPrices({fetcher:async()=>({ok:true,headers:{get:()=>null},text:async()=>'{bad'}),storage:{setItem(){}}}));assert.equal(priceSnapshot(),current);assert.equal(priceBusy(),false);
 await assert.rejects(syncPrices({fetcher:async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify(before)}),storage:{setItem(){}}}),/older/);assert.equal(priceSnapshot(),current);
});
