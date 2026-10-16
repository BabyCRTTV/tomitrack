#!/usr/bin/env python3
"""Manually refresh public catalog inputs; inspect changes before building/publishing."""
import argparse,json,re,hashlib,concurrent.futures,urllib.request
from pathlib import Path
from urllib.parse import urlparse,parse_qs,urljoin
from datetime import date
from bs4 import BeautifulSoup
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,default=ROOT/'.cache/catalog');p.add_argument('--refresh',action='store_true');args=p.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
def fetch(url,key):
 file=args.cache/key
 if args.refresh or not file.exists():
  request=urllib.request.Request(url,headers={'User-Agent':'TomiTrackCatalog/0.3 (+https://github.com/BabyCRTTV/tomitrack)'})
  with urllib.request.urlopen(request,timeout=30)as response:file.write_bytes(response.read())
 return file.read_bytes()
def save(name,data):
 (ROOT/'catalog/input'/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
hw_url='https://raw.githubusercontent.com/rkpacheco/hotwheels-database/04f57210dcba971bd9bdd8a5364493b9214c7b9c/HW_DB.json'
old_url='https://raw.githubusercontent.com/pvwnthem/Hotwheels-Data/f8129cca1b34ad33a893d93ecfb0e5c0297eefe5/HotApi.json'
hw_bytes=fetch(hw_url,'hot-wheels-pinned.json');old_bytes=fetch(old_url,'hot-wheels-positions-pinned.ndjson')
raw=json.loads(hw_bytes);hw=[{**{k:v for k,v in x.items()if k!='image_url'},'sourceRow':i+1}for i,x in enumerate(raw)if isinstance(x.get('year'),int)and 2009<=x['year']<=2026]
# Keep the established 2014+ order first so extending history does not rename canonical castings.
hw.sort(key=lambda x:x['year']<2014);save('hot-wheels',hw)
chunks=[];chunk=[]
for line in old_bytes.decode().splitlines():
 if not line.strip():continue
 row=json.loads(line)
 if any(str(v).startswith('By Year:')for v in row.values()):chunks.append(chunk);chunk=[]
 else:chunk.append(row)
known={y:{str(x.get('toyNumber'))for x in hw if x['year']==y}for y in range(2009,2024)};enrichment=[]
for items in chunks:
 scores={y:sum(x.get('id')in known[y]for x in items)for y in known};year=max(scores,key=scores.get)
 # Older source lacks year fields. Enrich only groups where >=75% of SKUs agree with one pinned annual set.
 if not items or scores[year]<len(items)*.75:continue
 for x in items:
  if x.get('id')in known[year]and x.get('Series #'):enrichment.append({'year':year,'toyNumber':x['id'],'seriesNumber':re.sub(r'[\u200b-\u200f]','',x['Series #']).strip()})
save('hot-wheels-series-numbers',enrichment)
def lineup(arg):
 year,region=arg;url=f'https://www.bamca.org/cgi-bin/lineup.cgi?year={year}&region={region}&lty=man&lty=series&lty=pack';body=fetch(url,f'matchbox-{year}-{region}.html');s=BeautifulSoup(body,'html.parser');rows=[]
 if not s.title or str(year)not in s.title.get_text():raise ValueError('Unexpected lineup year: '+url)
 for cell in s.select('td.eb'):
  title=cell.select_one('.modelname');a=title.find_parent('a')if title else None
  if not a:continue
  href=urljoin(url,a.get('href',''));man=parse_qs(urlparse(href).query).get('id',[''])[0]
  if not re.fullmatch(r'MB\d{1,5}[A-Z]?',man,re.I):continue
  table=cell.find_parent('table');headers=[x.get_text(' ',strip=True)for x in table.select('th.rh')if x.get_text(' ',strip=True)];series=headers[0]if headers else'Matchbox Mainline'
  if year<2014 and table.select_one('th.sh'):
   # 2009–2012 have several themed mainline sections inside one regional table.
   section=''
   for tr in cell.find_parent('tr').find_previous_siblings('tr'):
    names=[x.get_text(' ',strip=True)for x in tr.select('th.rh')if x.get_text(' ',strip=True)]
    if names:section=names[0];break
   series='Matchbox Mainline'+(' · '+section if section else'')
  category='moving-parts'if series=='Moving Parts'else'collectors'if series=='Matchbox Collectors'else'promotional'if 'Promotional'in series else'mainline'if series.startswith('Matchbox Mainline')else'other'
  num=cell.select_one('.modelnumber');number=num.get_text(' ',strip=True).strip('. ')if num else''
  for desc in [x.get_text(' ',strip=True)for x in cell.select('.varentry')]or['']:
   rows.append({'year':year,'name':title.get_text(' ',strip=True),'manNumber':man.upper(),'collectorNumber':number,'variant':desc,'seriesName':series,'categoryId':category,'region':'US'if region=='U'else'International','sourceUrl':href,'lineupUrl':url})
 if not rows:raise ValueError('No readable casting records: '+url)
 return {'year':year,'region':region,'url':url,'sha256':hashlib.sha256(body).hexdigest(),'rows':rows}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(lineup,[(y,r)for y in [*range(2014,2026),*range(2009,2014)]for r in ['U','R']]))
save('matchbox',[r for x in results for r in x['rows']]);save('matchbox-sources',[{k:v for k,v in x.items()if k!='rows'}for x in results])
url='https://jamesdiecast.com/matchbox/basic/tracker/';body=fetch(url,'matchbox-2026-tracker.html');s=BeautifulSoup(body,'html.parser');rows=[]
if not s.title or '2026'not in s.title.get_text():raise ValueError('Review tracker year before importing')
for tr in s.select('.tracker-table tbody tr'):
 cells=tr.find_all('td',recursive=False)
 if len(cells)!=2:continue
 a=cells[1].find('a',href=True)
 if not a:continue
 number=cells[0].get_text(strip=True)
 if not re.fullmatch(r'\d{1,3}/125',number):continue
 rows.append({'name':a.get_text(' ',strip=True),'year':2026,'brandId':'matchbox','categoryId':'mainline','seriesName':'Matchbox Mainline','productCode':'','manNumber':'','collectorNumber':number,'seriesNumber':'','variant':'','color':'','tags':['Casting ID pending'],'regions':[],'sourceRefs':[{'sourceId':'james-mb2026','url':urljoin(url,a['href']),'lineupUrl':url}]})
if not rows:raise ValueError('No listed 2026 positions')
save('matchbox-2026',rows);save('matchbox-2026-source',{'url':url,'sha256':hashlib.sha256(body).hexdigest(),'retrievedAt':str(date.today()),'records':len(rows)})
save('snapshot-hashes',[{'url':hw_url,'sha256':hashlib.sha256(hw_bytes).hexdigest()},{'url':old_url,'sha256':hashlib.sha256(old_bytes).hexdigest()}])
print(f'Fetched {len(hw)} Hot Wheels input rows, {sum(len(x["rows"])for x in results)} Matchbox references and {len(rows)} 2026 positions. Review source diffs; run npm run catalog:build afterwards. Nothing is published by this script.')
