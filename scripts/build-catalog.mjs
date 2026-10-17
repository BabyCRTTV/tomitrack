import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {appendTomica} from './build-tomica.mjs';
import {canonicalGtin} from '../web/app/catalog.js';
const searchText=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[’‘`']/g,'').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const input=name=>JSON.parse(readFileSync(`catalog/input/${name}.json`,'utf8'));
const digest=value=>createHash('sha256').update(value).digest('hex').slice(0,16);
const slug=value=>searchText(value).replaceAll(' ','-');
const clean=value=>String(value??'').replace(/[\u200b-\u200f]/g,'').replace(/\s+/g,' ').trim();
const sources=[
 {id:'hw-snapshot',name:'Hot Wheels Wiki contributors · rkpacheco data snapshot',url:'https://github.com/rkpacheco/hotwheels-database/blob/04f57210dcba971bd9bdd8a5364493b9214c7b9c/HW_DB.json',revision:'04f57210dcba971bd9bdd8a5364493b9214c7b9c',date:'2026-07-15',license:'Fandom-derived facts; CC BY-SA 3.0 attribution',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
 {id:'hw-series-positions',name:'Hot Wheels Wiki contributors · pvwnthem series-position snapshot',url:'https://github.com/pvwnthem/Hotwheels-Data/blob/f8129cca1b34ad33a893d93ecfb0e5c0297eefe5/HotApi.json',revision:'f8129cca1b34ad33a893d93ecfb0e5c0297eefe5',date:'2022-12-25',license:'Fandom-derived facts; CC BY-SA 3.0 attribution',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
 {id:'bamca',name:'BAMCA · Dean Dierschow and database contributors',url:'https://www.bamca.org/database.php',date:'2026-10-16',license:'Factual lineup references; no photographs or site text reproduced',licenseUrl:'https://www.bamca.org/pages/about.php'},
 {id:'james-mb2026',name:'JamesDiecast.com · 2026 Matchbox Basic tracker',url:'https://jamesdiecast.com/matchbox/basic/tracker/',date:'2026-09-09',license:'Numbered product identity facts; no photos or editorial text reproduced'},
 ...input('barcodes').sources
];
const castings=new Map(),series=new Map(),releases=new Map(),rejected=[];let duplicates=0;
const positions=new Map(input('hot-wheels-series-numbers').map(x=>[`${x.year}|${x.toyNumber}`,x.seriesNumber]));
function add(row){
 const name=clean(row.name),year=Number(row.year);if(!name||/^(tba|tbd|unknown|n\/a|none|by year:)/i.test(name)||name.length>200||!Number.isInteger(year)||year<2009||year>2026){rejected.push({reason:'Missing or unsupported release identity',row});return}
 const {brandId,categoryId}=row,castingId=brandId==='matchbox'?row.manNumber?`mb-${row.manNumber.toLowerCase()}`:`mb-unlinked-${digest(name)}`:`hw-${slug(name)}`;
 let casting=castings.get(castingId);if(!casting){casting={id:castingId,brandId,name,aliases:[]};castings.set(castingId,casting)}else if(casting.name!==name&&!casting.aliases.includes(name))casting.aliases.push(name);
 const seriesName=clean(row.seriesName)||'Mainline',seriesId=`${brandId}-${year}-${digest(categoryId+'|'+searchText(seriesName))}`;
 if(!series.has(seriesId))series.set(seriesId,{id:seriesId,brandId,year,categoryId,name:seriesName,family:searchText(seriesName.replace(/\s*\/?\s*New for \d{4}!*/gi,''))});
 const identity=[brandId,castingId,year,row.productCode||row.manNumber,row.collectorNumber,row.variant||'',seriesId,row.color||''].join('|'),id=`${brandId==='matchbox'?'mb':'hw'}-${year}-${digest(identity)}`;
 if(releases.has(id)){const existing=releases.get(id);existing.regions=[...new Set([...existing.regions,...row.regions])];for(const ref of row.sourceRefs)if(!existing.sourceRefs.some(x=>JSON.stringify(x)===JSON.stringify(ref)))existing.sourceRefs.push(ref);duplicates++;return}
 releases.set(id,{id,name,brandId,castingId,seriesId,year,categoryId,productCode:clean(row.productCode),manNumber:clean(row.manNumber),collectorNumber:clean(row.collectorNumber),seriesNumber:clean(row.seriesNumber),color:clean(row.color),variant:clean(row.variant),tags:row.tags||[],regions:row.regions||[],sourceRefs:row.sourceRefs});
}
const categories={'Mainline':'mainline','Premium':'premium','Silver Series':'silver','Fast & Furious':'themed','Neon Speeders':'themed'};
input('hot-wheels').forEach((x,i)=>{
 const variant=clean(x.name.match(/\(([^)]*(?:Color|Zamac|Treasure Hunt)[^)]*)\)/i)?.[1]||''),name=clean(x.name.replace(/\s*\([^)]*(?:Color|Zamac|Treasure Hunt)[^)]*\)/ig,''));
 const refs=[{sourceId:'hw-snapshot',row:x.sourceRow||i+1}],seriesNumber=positions.get(`${x.year}|${x.toyNumber}`)||'';if(seriesNumber)refs.push({sourceId:'hw-series-positions'});
 add({name,year:x.year,brandId:'hot-wheels',categoryId:categories[x.line_type]||'other',seriesName:x.series||x.line_type,productCode:x.toyNumber,collectorNumber:x.collectorNumber,seriesNumber,variant,color:'',tags:[...(/super treasure hunt/i.test(x.name+' '+x.series)?['Super Treasure Hunt']:/treasure hunt/i.test(x.name+' '+x.series)?['Treasure Hunt']:[]),...(/zamac/i.test(x.name+' '+x.series)?['ZAMAC']:[])],regions:[],sourceRefs:refs});
});
input('matchbox').forEach(x=>add({name:x.name,year:x.year,brandId:'matchbox',categoryId:x.categoryId||'mainline',seriesName:x.seriesName||'Matchbox Mainline',productCode:'',manNumber:x.manNumber,collectorNumber:x.collectorNumber,seriesNumber:'',color:clean(x.variant.split(',')[0]).slice(0,50),variant:x.variant,tags:[],regions:[x.region],sourceRefs:[{sourceId:'bamca',url:x.sourceUrl,lineupUrl:x.lineupUrl}]}));
input('curated-releases').forEach(add);
input('matchbox-2026').forEach(add);
const tomica=appendTomica({castings,series,releases,sources});rejected.push(...input('tomica-rejections'));
const all=[...releases.values()].sort((a,b)=>a.id.localeCompare(b.id)),identifiers=[];
for(const x of input('barcodes').identifiers){if(!canonicalGtin(x.value))throw new Error('Invalid curated GTIN');if(x.scope==='release'){
 const matches=all.filter(r=>r.brandId===x.brandId&&r.year===x.year&&(x.curatedId?r.sourceRefs.some(ref=>ref.curatedId===x.curatedId):r.productCode===x.productCode));if(!matches.length)throw new Error('Curated barcode has no release: '+x.productCode);identifiers.push({...x,releaseIds:matches.map(x=>x.id)});
 }else identifiers.push(x)}
identifiers.push(...tomica.identifiers);
const coverage=[];for(const brandId of ['hot-wheels','matchbox','tomica','tomica-limited-vintage'])for(let year=brandId==='tomica'?1970:brandId==='tomica-limited-vintage'?2004:2009;year<=2026;year++){const rows=all.filter(x=>x.brandId===brandId&&x.year===year);coverage.push({brandId,year,releases:rows.length,seriesNumbers:rows.filter(x=>x.seriesNumber).length,colorKnown:rows.filter(x=>x.color).length,status:rows.length?'partial':'not-imported'})}
const data={schema:1,version:'2026.10.16.3',builtAt:'2026-10-16',scope:'Tomica 1970–2026; Hot Wheels/Matchbox 2009–2026; partial reference catalog, not every release or packaging variant',brands:[{id:'hot-wheels',name:'Hot Wheels'},{id:'matchbox',name:'Matchbox'},{id:'tomica',name:'Tomica'},{id:'tomica-limited-vintage',name:'Tomica Limited Vintage'}],researchGaps:(()=>{const r=input('tomica-fetch-report');return {tomica:{undatedProducts:r.undatedProducts.length,unavailableMonthlyPages:r.unavailableMonthlyPages.length,excludedDateListings:r.futureListingsExcluded.length,notes:['Tomica Limited: identified products lack reviewed release years; not imported yet.','Historic variants, commemoratives, regional packages and exact colors remain incomplete.','Casting links are conservative; official announcement and collector naming differences may remain separate.']}}})(),sources,castings:[...castings.values()].sort((a,b)=>a.id.localeCompare(b.id)),series:[...series.values()].sort((a,b)=>a.id.localeCompare(b.id)),releases:all,identifiers,coverage};
mkdirSync('web/app/catalog',{recursive:true});const json=JSON.stringify(data);writeFileSync('web/app/catalog/data.js','// Generated by npm run catalog:build. See catalog/README.md for sources and coverage.\nexport default '+json+';\n');writeFileSync('catalog/catalog.json',json+'\n');writeFileSync('catalog/import-report.json',JSON.stringify({version:data.version,total:all.length,castings:castings.size,series:series.size,duplicatesMerged:duplicates,tomicaReferencesMerged:tomica.merged,rejected,coverage},null,2)+'\n');console.log(`Catalog: ${all.length} releases, ${castings.size} castings, ${series.size} yearly series; ${rejected.length} rejected, ${duplicates} duplicate references merged.`);
