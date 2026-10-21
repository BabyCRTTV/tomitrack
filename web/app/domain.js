import {unitValue,priceScope} from './pricing.js';
export const VERSION = '0.4.18';
export const BRANDS = ['Mini GT','Tomica','Tomica Limited Vintage','Hot Wheels','Matchbox','Pop Race','INNO64','Auto World','Tarmac Works','Other'];
export function cleanItem(input) {
  const text = (k, max=200) => String(input[k] ?? '').trim().slice(0,max);
  const num = (k, max=10000000) => { const n = Number(input[k] ?? 0); if (!Number.isFinite(n) || n < 0 || n > max) throw new Error(`Invalid ${k}`); return n; };
  const name = text('name'); if (!name) throw new Error('Please enter a model name.');
  const quantity = num('quantity',10000); if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be a whole number of at least 1.');
  const releaseYear=text('releaseYear',4);if(releaseYear&&(!/^\d{4}$/.test(releaseYear)||Number(releaseYear)<1900||Number(releaseYear)>2100))throw new Error('Enter a valid release year.');
  const image = String(input.image || ''); if (image && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) throw new Error('Unsupported photo.');
  if (image.length > 1800000) throw new Error('Photo is too large.');
  return {catalogReleaseId:text('catalogReleaseId',100),catalogCastingId:text('catalogCastingId',220),releaseYear,productCode:text('productCode',60),collectorNumber:text('collectorNumber',30),seriesNumber:text('seriesNumber',30),manNumber:text('manNumber',30),upc:text('upc',30),id: text('id',80) || crypto.randomUUID(), name, brand: text('brand'), series: text('series'), scale: text('scale',30), color: text('color',50), condition: ['Sealed','Boxed','Loose'].includes(input.condition) ? input.condition : 'Boxed', quantity, valuationMode:input.valuationMode==='market'&&Object.hasOwn(priceScope,text('catalogReleaseId',100))?'market':'manual', paid:num('paid'), value:num('value'), status:input.status === 'wish' ? 'wish' : 'owned', shelf:text('shelf',80), notes:text('notes',2000), image, added:text('added',50) || new Date().toISOString()};
}
export function totals(items) {
  return items.filter(x=>x.status==='owned').reduce((s,x)=>({count:s.count+x.quantity,castings:s.castings+1,cost:s.cost+x.paid*x.quantity,value:s.value+unitValue(x)*x.quantity}),{count:0,castings:0,cost:0,value:0});
}
export function validateBackup(data) {
  if (data?.format !== 'tomitrack' || data.schema !== 1 || !Array.isArray(data.items) || data.items.length > 10000) throw new Error('Choose a valid TomiTrack v1 backup.');
  const items = data.items.map(cleanItem); if (new Set(items.map(x=>x.id)).size !== items.length) throw new Error('Backup contains duplicate IDs.');
  return {items,history:[]};
}
export function filterItems(items, {query='',brand='',status='owned',sort='newest'}={}) {
  const q=query.toLowerCase().trim();
  return items.filter(x=>x.status===status && (!brand||x.brand===brand) && (!q||[x.name,x.brand,x.series,x.color,x.shelf,x.notes,x.releaseYear,x.productCode,x.collectorNumber,x.seriesNumber,x.manNumber,x.upc].join(' ').toLowerCase().includes(q))).sort((a,b)=>sort==='value'?unitValue(b)*b.quantity-unitValue(a)*a.quantity:sort==='name'?a.name.localeCompare(b.name):b.added.localeCompare(a.added));
}
export const CATALOG = [
  ['Nissan Skyline GT-R (R34)','Mini GT','Bayside blue','#5e91b7',32],
  ['Porsche 911 GT3 RS','Mini GT','Guards red','#e35548',26],
  ['Toyota Supra (A80)','Tomica','Super white','#d9d9d0',18],
  ['Mazda RX-7 (FD3S)','INNO64','Sunburst yellow','#e8c459',35],
  ['Honda Civic Type R','Pop Race','Championship white','#d7ddd6',24],
  ['Nissan Silvia (S15)','Tarmac Works','Pearl purple','#9e8cac',29],
  ['Datsun 510','Hot Wheels','Vintage orange','#c67d4c',9],
  ['Mercedes-Benz 190 E','Tomica Limited Vintage','Silver','#afb4b9',38]
].map((x,i)=>({catalogId:i,name:x[0],brand:x[1],color:x[2],paint:x[3],exampleValue:x[4],scale:'1:64',series:'Illustrative catalog entry'}));
export function demoData() {
  const items=CATALOG.slice(0,6).map((x,i)=>cleanItem({...x,id:`demo-${i}`,quantity:i===0?2:1,paid:x.exampleValue-5,value:x.exampleValue,status:i===5?'wish':'owned',condition:i%2?'Sealed':'Boxed',added:new Date(Date.now()-(6-i)*86400000).toISOString()}));
  const v=totals(items).value; return {items,history:Array.from({length:12},(_,i)=>({date:new Date(Date.now()-(11-i)*86400000).toISOString(),value:Math.round(v*(.7+i*.027))})).concat({date:new Date().toISOString(),value:v})};
}
