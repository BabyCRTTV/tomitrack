// Manual DOM evidence processing. Optional jsdom lives in the local research tools.
import fs from 'node:fs';import {JSDOM} from '../.tools/ui/node_modules/jsdom/lib/api.js';
const data=JSON.parse(fs.readFileSync('catalog/catalog.json')),manifest=JSON.parse(fs.readFileSync('.cache/tomica-prices/manifest.json'));
const rows=data.releases.filter(r=>r.brandId==='tomica');
const norm=s=>s.normalize('NFKC').replace(/\s+/g,'').toLowerCase();
const stripped=s=>s.normalize('NFKC').trim().replace(/^(?:No\.\s*)?\d+\s+/i,'');
const msrp={},proof={},unmatched=[],conflicts=[];
for(const page of manifest){if(!page.file)continue;const doc=new JSDOM(fs.readFileSync('.cache/tomica-prices/'+page.file),{url:page.url}).window.document;
 const headings=[...doc.querySelectorAll('.CarName')];
 const candidates=headings.map((h,index)=>{
  let box=h.parentElement,price=null;
  while(box&&box!==doc.body){const ps=[...box.querySelectorAll('.CarPrice')],hs=[...box.querySelectorAll('.CarName')];if(ps.length===1&&hs.includes(h)&&(hs.length===1||/各/.test(ps[0].textContent))){price=ps[0].textContent;break}if(ps.length>1||hs.length>1)break;box=box.parentElement}
  if(!price)return null;
  const text=price.normalize('NFKC'),matches=[...text.matchAll(/メーカー希望小売価格\s*(?:各)?\s*([\d,]+)円\s*\(税込\)/g)];if(matches.length!==1)return null;
  const amount=Number(matches[0][1].replaceAll(',',''));if(!Number.isInteger(amount)||amount<=0)return null;
  const title=h.textContent.trim().replace(/\s+/g,' '),prefix=title.normalize('NFKC').match(/^(?:No\.\s*)?(\d+)\s+/i);
  return {title,amount,priceText:price.trim().replace(/\s+/g,' '),row:index+1,code:prefix?.[1]||''};
 }).filter(Boolean);
 for(const r of rows.filter(r=>r.sourceRefs.some(s=>s.sourceId==='takara-tomica-new'&&s.url===page.url))){
  const ref=r.sourceRefs.find(s=>s.sourceId==='takara-tomica-new'&&s.url===page.url);
  const found=candidates.filter(c=>norm(stripped(c.title))===norm(stripped(r.name))&&(!c.code||!r.productCode||Number(c.code)===Number(r.productCode)));
  // Row alone never establishes identity. Reordered pages can still match an exact unique title/code.
  if(found.length!==1){unmatched.push({releaseId:r.id,sourceUrl:page.url,reason:found.length?'Ambiguous title':'No exact title with explicit tax-inclusive MSRP'});continue}
  const c=found[0];if(msrp[r.id]&&msrp[r.id].amount!==c.amount){conflicts.push({releaseId:r.id,sourceUrls:[msrp[r.id].sourceUrl,page.url],amounts:[msrp[r.id].amount,c.amount]});continue}
  if(!msrp[r.id]){msrp[r.id]={amount:c.amount,currency:'JPY',taxIncluded:true,sourceUrl:page.url,observedAt:page.checkedAt};proof[r.id]={title:c.title,priceText:c.priceText,sourceRow:c.row,catalogSourceRow:ref.row,sourceSha256:page.sha256,match:'Exact normalized full title and source URL; numbered prefix checked against product code.'}}
 }
 doc.defaultView.close();
}
for(const c of conflicts){delete msrp[c.releaseId];delete proof[c.releaseId]}
const out={schema:1,brandId:'tomica',asOf:new Date().toISOString(),msrp,sales:[],evidence:proof,sources:manifest,unmatched,conflicts};
fs.writeFileSync('catalog/input/tomica-prices.json',JSON.stringify(out,null,2)+'\n');
console.log('Tomica MSRPs',Object.keys(msrp).length,'unmatched citations',unmatched.length,'conflicts',conflicts.length);
console.log('By year',Object.entries(Object.groupBy(Object.keys(msrp),id=>rows.find(r=>r.id===id).year)).map(([year,ids])=>[year,ids.length]));
