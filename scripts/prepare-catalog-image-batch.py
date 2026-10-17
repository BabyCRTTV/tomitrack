#!/usr/bin/env python3
"""Manually verify a capped photo batch; never runs during builds/startup."""
import concurrent.futures,datetime,hashlib,io,json,threading
import requests
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'catalog/catalog.json').read_text());queue=json.loads((root/'catalog/input/catalog-images.json').read_text())['images']
cache=root/'.cache/image-verification';cache.mkdir(parents=True,exist_ok=True)
rows=[r for r in data['releases']if r['id']in queue and r['brandId']in ['tomica','tomica-limited-vintage']]
rows.sort(key=lambda r:(0 if r['brandId']=='tomica'else 1,-r['year'],r['id']))
sessions=threading.local()
def verify(url):
 p=cache/(hashlib.sha256(url.encode()).hexdigest()+'.json')
 if p.exists():return json.loads(p.read_text())
 try:
  if not hasattr(sessions,'client'):
   sessions.client=requests.Session();sessions.client.headers['User-Agent']='TomiTrack catalog image review (+https://github.com/BabyCRTTV/tomitrack)'
  with sessions.client.get(url,timeout=22)as response:
   response.raise_for_status();raw=response.content;mime=response.headers.get('Content-Type','').split(';')[0];final=response.url
  if len(raw)>20*1024*1024:raise ValueError('Image exceeds review limit')
  with Image.open(io.BytesIO(raw))as image:width,height=image.size;image.verify()
  if not mime.startswith('image/')or min(width,height)<80:raise ValueError('Not a usable source image')
  result={'ok':True,'width':width,'height':height,'contentType':mime,'sha256':hashlib.sha256(raw).hexdigest(),'finalUrl':final,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')}
 except Exception as error:result={'ok':False,'error':str(error)}
 if result['ok']:p.write_text(json.dumps(result))
 return result
selected=[];evidence={};failures=[];cursor=0
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
 while len(selected)<500 and cursor<len(rows):
  group=rows[cursor:cursor+(500-len(selected))];cursor+=len(group)
  urls=list(dict.fromkeys(queue[r['id']]['url']for r in group));pending=[u for u in urls if u not in evidence]
  for n,(url,result)in enumerate(zip(pending,pool.map(verify,pending)),1):
   evidence[url]=result
   if n%25==0:print(f'Checked {n}/{len(pending)} unique images for this group',flush=True)
  for r in group:
   url=queue[r['id']]['url']
   if evidence[url]['ok']:selected.append(r['id'])
   else:failures.append({'releaseId':r['id'],'url':url,'error':evidence[url]['error']})
if len(selected)!=500:raise RuntimeError('Could not verify a full 500-entry batch; existing published selection is untouched.')
active={queue[rid]['url']for rid in selected};out={'schema':1,'id':'2026-10-17-001','limit':500,'releaseIds':selected,'verifiedAssets':{u:evidence[u]for u in sorted(active)},'failures':failures,'note':'First 500 verified Tomica/TLV release photo references. Remaining discovered links are queued, not published photos.'}
(root/'catalog/input/catalog-image-batch.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(f'Batch ready: {len(selected)} releases, {len(active)} distinct source images, {len(failures)} skipped unavailable references.',flush=True)
