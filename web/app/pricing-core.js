export const MIN_SALES=3,WINDOW_DAYS=180;
export const ANNUAL_FACTOR=1.10;
const DAY=86400000;
const date=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
const calendarDate=x=>/^\d{4}-\d{2}-\d{2}$/.test(x)&&date(x)&&new Date(x).toISOString().slice(0,10)===x;
export function validPriceSource(value,kind){
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return false;
  if(kind==='msrp')return (u.hostname==='minicar.tomytec.co.jp'&&u.pathname==='/product/detail.html'&&/^\?id=\d+$/.test(u.search))||(u.hostname==='www.takaratomy.co.jp'&&/^\/products\/tomica\/new\/\d{4}\.htm$/.test(u.pathname)&&!u.search);
  return !u.search&&((u.hostname==='www.ebay.com'&&/^\/itm\/\d{12}$/.test(u.pathname))||(u.hostname==='www.catawiki.com'&&/^\/en\/l\/\d+-[a-z0-9-]+$/.test(u.pathname)));
 }catch{return false}
}
export function validatePrices(input,scope,now=Date.now()){
 if(input?.schema!==2||JSON.stringify(input.brandIds)!==JSON.stringify(['tomica','tomica-limited-vintage'])||!date(input.asOf)||Date.parse(input.asOf)>now+DAY||!input.msrp||typeof input.msrp!=='object'||Array.isArray(input.msrp)||!Array.isArray(input.sales)||input.sales.length>50000)throw Error('Unsupported price snapshot.');
 const msrp={};for(const[id,x]of Object.entries(input.msrp)){
  if(!Object.hasOwn(scope,id)||!Number.isInteger(x.amount)||x.amount<=0||x.amount>10000000||x.currency!=='JPY'||x.taxIncluded!==true||!validPriceSource(x.sourceUrl,'msrp')||!scope[id].sourceUrls.includes(x.sourceUrl)||!date(x.observedAt)||Date.parse(x.observedAt)>Date.parse(input.asOf)+DAY)throw Error('Invalid MSRP record.');
  msrp[id]={amount:x.amount,currency:'JPY',taxIncluded:true,sourceUrl:x.sourceUrl,observedAt:x.observedAt};
 }
 const f=input.fx;if(!f||!calendarDate(f.date)||Date.parse(f.date)>Date.parse(input.asOf)||Date.parse(input.asOf)-Date.parse(f.date)>10*DAY||f.sourceUrl!=='https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'||!Number.isFinite(f.usdPerEur)||f.usdPerEur<.1||f.usdPerEur>10||!Number.isFinite(f.jpyPerEur)||f.jpyPerEur<10||f.jpyPerEur>1000)throw Error('Invalid exchange rate evidence.');
 const seen=new Set();const sales=input.sales.map(x=>{
  if(!Object.hasOwn(scope,x.releaseId)||x.productCode!==scope[x.releaseId].productCode||!validPriceSource(x.sourceUrl,'sale')||seen.has(x.sourceUrl)||!['Boxed','Sealed','Loose'].includes(x.condition)||!Number.isSafeInteger(x.amountCents)||x.amountCents<=0||x.amountCents>1000000000||x.currency!=='USD'||x.verified!==true||x.finalPriceKnown!==true||x.lotSize!==1||x.shippingExcluded!==true||!['fixed-price','auction'].includes(x.saleType)||!calendarDate(x.soldAt)||Date.parse(x.soldAt)>now||!date(x.observedAt)||Date.parse(x.observedAt)>Date.parse(input.asOf)+DAY)throw Error('Invalid or ambiguous sold-price record.');
  seen.add(x.sourceUrl);return {releaseId:x.releaseId,productCode:x.productCode,sourceUrl:x.sourceUrl,condition:x.condition,amountCents:x.amountCents,currency:'USD',soldAt:x.soldAt,observedAt:x.observedAt,verified:true,finalPriceKnown:true,lotSize:1,shippingExcluded:true,saleType:x.saleType};
 });
 return {schema:2,brandIds:input.brandIds,asOf:input.asOf,msrp,sales,fx:{date:f.date,usdPerEur:f.usdPerEur,jpyPerEur:f.jpyPerEur,sourceUrl:f.sourceUrl}};
}
export function marketQuote(snapshot,id,condition='Boxed',now=Date.now()){
 const sales=snapshot.sales.filter(s=>s.releaseId===id&&s.condition===condition&&now-Date.parse(s.soldAt)>=0&&now-Date.parse(s.soldAt)<=WINDOW_DAYS*DAY);
 let used=[...sales].sort((a,b)=>a.amountCents-b.amountCents);
 if(used.length>=5){const q1=used[Math.floor((used.length-1)*.25)].amountCents,q3=used[Math.floor((used.length-1)*.75)].amountCents,iqr=q3-q1;used=used.filter(s=>s.amountCents>=q1-1.5*iqr&&s.amountCents<=q3+1.5*iqr)}
 return {amount:used.length>=MIN_SALES?Math.round(used.reduce((n,s)=>n+s.amountCents,0)/used.length)/100:null,kind:'sold-average',currency:'USD',condition,sampleCount:used.length,observedCount:sales.length,excludedCount:sales.length-used.length,sales:used,windowDays:WINDOW_DAYS};
}
export function valuationQuote(snapshot,scope,id,condition='Boxed',now=Date.now()){
 if(!Object.hasOwn(scope,id))return {amount:null,kind:'unavailable'};
 const market=marketQuote(snapshot,id,condition,now);if(market.amount!==null)return market;
 const msrp=snapshot.msrp[id];if(!msrp)return {...market,kind:'unavailable'};
 const years=Math.max(0,new Date(now).getUTCFullYear()-scope[id].year),baseUsd=msrp.amount*snapshot.fx.usdPerEur/snapshot.fx.jpyPerEur;
 const amount=Math.round(baseUsd*ANNUAL_FACTOR**years*100)/100;
 return {...market,amount:amount<=10000000?amount:null,kind:'msrp-rule',years,baseUsd,fxDate:snapshot.fx.date,msrpYen:msrp.amount};
}

export function convertedMsrp(snapshot,id){const m=snapshot.msrp[id];return m?Math.round(m.amount*snapshot.fx.usdPerEur/snapshot.fx.jpyPerEur*100)/100:null;}
