import{readFileSync,writeFileSync}from'node:fs';
import{validatePrices}from'../web/app/pricing-core.js';
const data=JSON.parse(readFileSync('catalog/catalog.json')),input=JSON.parse(readFileSync('catalog/input/tlv-prices.json'));
const scope=Object.fromEntries(data.releases.filter(r=>r.brandId==='tomica-limited-vintage').map(r=>[r.id,{productCode:r.productCode,year:r.year,sourceUrl:r.sourceRefs.find(s=>s.sourceId==='tomytec-catalog').url}]));
const prices=validatePrices(input,scope);
writeFileSync('web/app/catalog/pricing-data.js','// Generated from reviewed TLV pricing evidence.\nexport default '+JSON.stringify({scope,prices})+';\n');
writeFileSync('web/app/catalog/prices.json',JSON.stringify(prices)+'\n');
console.log('Pricing:',Object.keys(prices.msrp).length,'MSRPs;',prices.sales.length,'confirmed sales; FX',prices.fx.date);
