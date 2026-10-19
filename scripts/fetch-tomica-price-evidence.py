#!/usr/bin/env python3
"""Manual fetch of already-cited Tomica monthly pages, never startup or CI."""
from pathlib import Path
import json,urllib.request,hashlib,concurrent.futures
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1];folder=root/'.cache/tomica-prices';folder.mkdir(parents=True,exist_ok=True)
rows=json.loads((root/'catalog/catalog.json').read_text())['releases'];urls=sorted({s['url']for r in rows if r['brandId']=='tomica'for s in r['sourceRefs']if s['sourceId']=='takara-tomica-new'})
def get(url):
 path=folder/url.rsplit('/',1)[1]
 try:
  if not path.exists():
   with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'TomiTrack sourced price research (+https://github.com/BabyCRTTV/tomitrack)'}),timeout=25)as response:raw=response.read()
   path.write_bytes(raw)
  raw=path.read_bytes();return {'url':url,'file':path.name,'sha256':hashlib.sha256(raw).hexdigest(),'checkedAt':datetime.now(timezone.utc).isoformat(timespec='seconds')}
 except Exception as e:return {'url':url,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
 result=[]
 for i,r in enumerate(pool.map(get,urls),1):
  result.append(r)
  if i%20==0:print('Fetched',i,'of',len(urls),flush=True)
(folder/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print('Evidence:',sum('file'in r for r in result),'available;',sum('error'in r for r in result),'unavailable',flush=True)
