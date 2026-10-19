import bundled from './catalog/pricing-data.js';
import {validatePrices,valuationQuote} from './pricing-core.js';
export const PRICE_URL='https://babycrttv.github.io/tomitrack/app/catalog/prices.json';
const KEY='tomitrack-public-prices-v2';
export const PRICE_INTERVAL=48*60*60*1000;
let retryAfter=0;
export const priceScope=bundled.scope;
let snapshot=validatePrices(bundled.prices,priceScope),busy=false,lastSync='';
try{const saved=JSON.parse(localStorage.getItem(KEY)),cached=validatePrices(saved?.prices||saved,priceScope);if(Date.parse(cached.asOf)>=Date.parse(snapshot.asOf)){snapshot=cached;lastSync=Number.isFinite(Date.parse(saved.checkedAt))&&Date.parse(saved.checkedAt)<=Date.now()?saved.checkedAt:''}}catch{}
export const priceSyncDue=(now=Date.now())=>!busy&&now>=retryAfter&&(!lastSync||now-Date.parse(lastSync)>=PRICE_INTERVAL);
export const priceSnapshot=()=>snapshot;
export const priceBusy=()=>busy;
export const priceLastSync=()=>lastSync;
export const quote=(id,condition='Boxed')=>valuationQuote(snapshot,priceScope,id,condition);
export const usesPricing=item=>item.valuationMode==='market'&&quote(item.catalogReleaseId,item.condition).amount!==null;
export const unitValue=item=>usesPricing(item)?quote(item.catalogReleaseId,item.condition).amount:item.value;
export const valueLabel=item=>usesPricing(item)?'Market value':'Your estimate';
export async function syncPrices({fetcher=globalThis.fetch,storage=globalThis.localStorage}={}){
 if(busy)throw Error('A price sync is already running.');busy=true;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
  const r=await fetcher(PRICE_URL,{cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
  if(!r.ok)throw Error('Price update unavailable. Saved prices are unchanged.');
  if(Number(r.headers?.get('content-length')||0)>3000000)throw Error('Price download too large.');
  const text=await r.text();if(text.length>3000000)throw Error('Price download too large.');
  const next=validatePrices(JSON.parse(text),priceScope);
  if(Date.parse(next.asOf)<Date.parse(snapshot.asOf))throw Error('An older price snapshot was rejected.');
  const checkedAt=new Date().toISOString();storage?.setItem(KEY,JSON.stringify({prices:next,checkedAt}));snapshot=next;lastSync=checkedAt;retryAfter=0;return next;
 }catch(error){retryAfter=Date.now()+6*60*60*1000;throw error}finally{clearTimeout(timer);busy=false}
}
