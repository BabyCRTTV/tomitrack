#!/usr/bin/env python3
"""Refresh evidence for the reviewed Tomica snapshot; never overwrite reviewed identities.

The 0.4.0 normalized input was recovered from its hash-verified catalog projection
when the interrupted workspace expired. Review new raw evidence manually before
adding or correcting facts in catalog/input/tomica.json.
"""
import argparse,concurrent.futures,hashlib,json,urllib.request
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,default=ROOT/'.cache/tomica');p.add_argument('--refresh',action='store_true');args=p.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
data=json.loads((ROOT/'catalog/input/tomica.json').read_text())
urls=sorted({ref['url']for row in data['releases']for ref in row['sourceRefs']if ref['sourceId']=='takara-tomica-new'})
tasks=[(u,None)for u in urls]+[('https://sakuyaminicarjp.crayonsite.com/p/2/',None),('https://minicar.tomytec.co.jp/product/api/search.php',{'keyword':'','yyyy':'','mm':'','series':'','scale':'','release':'','maker':'','dataType':'all','sorts':'','page':200})]
def fetch(task):
 url,fields=task;key=hashlib.sha256(url.encode()).hexdigest();cache=args.cache/(key+'.response')
 if args.refresh or not cache.exists():
  import urllib.parse
  req=urllib.request.Request(url,data=urllib.parse.urlencode(fields).encode()if fields else None,headers={'User-Agent':'TomiTrackCatalog/0.4 (+https://github.com/BabyCRTTV/tomitrack)'})
  with urllib.request.urlopen(req,timeout=45)as r:body=r.read()
  if not body:raise ValueError('Empty evidence: '+url)
  if fields:
   d=json.loads(body)
   if not d.get('dblineup_src'):raise ValueError('Unexpected TOMYTEC response')
  cache.write_bytes(body)
 else:body=cache.read_bytes()
 return {'url':url,'sha256':hashlib.sha256(body).hexdigest(),'retrievedAt':datetime.now(timezone.utc).isoformat(),'request':fields or{},'note':'Evidence refreshed after interrupted workspace recovery; normalized identities remain unchanged.'}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(fetch,tasks))
output=ROOT/'catalog/input/tomica-sources.json';temp=output.with_suffix('.tmp');temp.write_text(json.dumps(results,ensure_ascii=False,separators=(',',':'))+'\n');temp.replace(output)
print(f'Verified {len(results)} public evidence snapshots. Reviewed catalog facts were not changed.')
