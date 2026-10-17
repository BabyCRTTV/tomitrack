#!/usr/bin/env python3
"""Manual, resumable source-image discovery. Does not run in builds or app startup."""
import concurrent.futures,hashlib,json,re,urllib.request,urllib.parse,time
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'catalog/catalog.json').read_text());cache=ROOT/'.cache/media/pages';cache.mkdir(parents=True,exist_ok=True)
urls=set()
for r in data['releases']:
 for ref in r['sourceRefs']:
  u=ref.get('url','')
  if u.startswith('https://www.takaratomy.co.jp/products/tomica/new/') and u.endswith('.htm'):urls.add(u)
urls.update(x['url'] for x in json.loads((ROOT/'catalog/input/matchbox-sources.json').read_text()))
def fetch(u):
 p=cache/(hashlib.sha256(u.encode()).hexdigest()+'.html')
 if p.exists():return u,p.read_text(),''
 try:
  req=urllib.request.Request(u,headers={'User-Agent':'TomiTrack catalog research (+https://github.com/BabyCRTTV/tomitrack)'})
  with urllib.request.urlopen(req,timeout=55) as resp:raw=resp.read();text=raw.decode(resp.headers.get_content_charset() or ('utf-8' if 'takaratomy' in u else 'latin-1'),errors='replace')
  p.write_text(text);return u,text,''
 except Exception as e:return u,'',str(e)
pages={};errors=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for i,(u,html,error) in enumerate(pool.map(fetch,sorted(urls)),1):
  if error:
   errors.append({'url':u,'error':error})
   if len(errors)<4:print(u,error,flush=True)
  else:pages[u]=html
  if i%12==0:print(f'Pages {i}/{len(urls)}; errors {len(errors)}',flush=True)

def norm(s):
 import unicodedata
 s=unicodedata.normalize('NFKC',s);s=re.sub(r'^No\.?\s*\d+\s*','',s,flags=re.I)
 return re.sub(r'[\s・･!！()（）「」『』【】\-—〜～/／:：]+','',s).lower()
def safe(u):return isinstance(u,str) and u.startswith(('https://static.wikia.nocookie.net/hotwheels/images/','https://www.bamca.org/pic/','https://www.takaratomy.co.jp/products/tomica/new/images/','https://minicar.tomytec.co.jp/common/api/image.php?'))
def record(url,source,credit,kind='release-reference'):
 assert safe(url),url
 return {'url':url,'sourceUrl':source,'credit':credit,'kind':kind,'rights':'Original image rights remain with the source image owner; no reuse license asserted.'}
images={};hw=json.loads((ROOT/'.cache/media/hotwheels.response').read_text())
# Source rows are pinned, 1-based positions in the original snapshot. No name-only matching.
for r in data['releases']:
 if r['brandId']!='hot-wheels':continue
 for ref in r['sourceRefs']:
  if ref['sourceId']!='hw-snapshot':continue
  x=hw[ref['row']-1]
  if int(x['year'])!=r['year'] or str(x.get('toyNumber') or '')!=r['productCode']:raise ValueError('Pinned Hot Wheels row mismatch '+r['id'])
  u=x.get('image_url','')
  if not safe(u):continue
  full=re.sub(r'/scale-to-width-down/\d+','',u)
  images[r['id']]=record(re.sub(r'/scale-to-width-down/\d+','/scale-to-width-down/640',u), 'https://hotwheels.fandom.com/wiki/File:'+urllib.parse.unquote(u.split('/')[7].split('?')[0]),'Hot Wheels Wiki image contributors')
  images[r['id']]['originalUrl']=full
# TOMYTEC official product ID links, with catalog JAN corroboration.
tomy=json.loads((ROOT/'.cache/media/tomytec.response').read_text());soup=BeautifulSoup(tomy['dblineup_src'],'html.parser');tlv={}
for a in soup.select('a[href*="detail.html?id="]'):
 img=a.find('img')
 if img and img.get('src'):tlv[urllib.parse.urljoin('https://minicar.tomytec.co.jp/product/',a['href'])]=urllib.parse.urljoin('https://minicar.tomytec.co.jp',img['src'])
# Annual BAMCA pages: use the actual variant image supplied in the same listing cell.
mb={};tm={}
for u,html in pages.items():
 s=BeautifulSoup(html,'html.parser')
 if 'bamca.org' in u:
  for cell in s.select('td.eb'):
   title=cell.select_one('.modelname');a=title.find_parent('a') if title else None;img=a.find('img') if a else None
   if img and img.get('src'):mb[urllib.parse.urljoin(u,a['href'])]=urllib.parse.urljoin(u,img['src'])
 else:
  entries={}
  for img in s.find_all('img'):
   src=urllib.parse.urljoin(u,img.get('src',''));alt=norm(img.get('alt',''))
   if '/products/tomica/new/images/' in src and alt:entries.setdefault(alt,[]).append(src)
  tm[u]=entries
for r in data['releases']:
 for ref in r['sourceRefs']:
  u=ref.get('url','')
  if r['brandId']=='tomica-limited-vintage' and u in tlv:
   image=tlv[u];jan=urllib.parse.parse_qs(urllib.parse.urlparse(image).query).get('jancode',[''])[0]
   known={x['value'] for x in data['identifiers'] if x['scope']=='release' and r['id'] in x['releaseIds']}
   if jan not in known:continue
   images[r['id']]=record(image,u,'TOMYTEC · manufacturer product image')
  elif r['brandId']=='matchbox' and u in mb:images[r['id']]=record(mb[u],u,'BAMCA · source photograph; photographer credits on linked source')
  elif r['brandId']=='tomica' and u in tm:
   matches=tm[u].get(norm(r['name']),[])
   # Use the first manufacturer reference for the matching product caption; never claim exact variant agreement.
   if matches:images[r['id']]=record(matches[0],u,'Takara Tomy · manufacturer reference image; confirm pictured color')
# Same linked casting only; explicitly labeled, never a fabricated exact-variant photograph.
bycasting={}
for r in data['releases']:
 if r['id'] in images:bycasting.setdefault(r['castingId'],r['id'])
for r in data['releases']:
 if r['id'] in images or r['castingId'] not in bycasting:continue
 rid=bycasting[r['castingId']];images[r['id']]={**images[rid],'kind':'casting-reference','referenceReleaseId':rid}
counts={b['id']:{'total':sum(r['brandId']==b['id'] for r in data['releases']),'images':sum(r['brandId']==b['id'] and r['id'] in images for r in data['releases']),'castingReferences':sum(r['brandId']==b['id'] and images.get(r['id'],{}).get('kind')=='casting-reference' for r in data['releases'])}for b in data['brands']}
result={'schema':1,'retrievedAt':'2026-10-17','policy':'Source-linked photographs; reference photos require confirmation against the variant. No image bytes redistributed.','counts':counts,'images':dict(sorted(images.items()))}
(ROOT/'catalog/input/catalog-images.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
(ROOT/'catalog/input/catalog-image-fetch-report.json').write_text(json.dumps({'pages':len(pages),'errors':errors,'counts':counts,'missingReleaseIds':[r['id']for r in data['releases']if r['id']not in images]},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(counts),flush=True)
