#!/usr/bin/env python3
"""Append one explicitly authorized 500-entry photo batch; never runs in builds/startup."""
import argparse,concurrent.futures,datetime,hashlib,io,json,threading,os,tempfile
import requests
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--batch-id',required=True);args=parser.parse_args()
if not args.batch_id or any(c not in '0123456789-' for c in args.batch_id):parser.error('Use a dated numeric batch ID')
manifest=root/'catalog/input/catalog-image-batch.json';original=manifest.read_bytes();published=json.loads(original)
batches=published.get('batches',[{k:published[k]for k in ['id','limit','releaseIds']}])
if any(b['id']==args.batch_id for b in batches):parser.error('Batch is already active; no changes made')
if len(set(published['releaseIds']))!=len(published['releaseIds']):raise ValueError('Published batch has duplicate release IDs')
data=json.loads((root/'catalog/catalog.json').read_text());queue=json.loads((root/'catalog/input/catalog-images.json').read_text())['images']
cache=root/'.cache/image-verification';cache.mkdir(parents=True,exist_ok=True)
previous=set(published['releaseIds']);rows=[r for r in data['releases']if r['id']in queue and r['id']not in previous and r['brandId']in ['tomica','tomica-limited-vintage']]
rows.sort(key=lambda r:(0 if r['brandId']=='tomica'else 1,-r['year'],r['id']))
rejected=json.loads((root/'catalog/input/catalog-image-rejections.json').read_text())['rejectedHashes']
sessions=threading.local()
def verify(url):
 key=hashlib.sha256(url.encode()).hexdigest();p=cache/(key+'.json');image_path=cache/(key+'.img')
 if p.exists():
  saved=json.loads(p.read_text())
  if saved.get('sha256')in rejected:return {'ok':False,'error':rejected[saved['sha256']]['reason']}
  if saved.get('ok')and saved.get('width',0)>=500 and saved.get('height',0)>=300:return saved
 try:
  if not hasattr(sessions,'client'):
   sessions.client=requests.Session();sessions.client.headers['User-Agent']='TomiTrack catalog image review (+https://github.com/BabyCRTTV/tomitrack)'
  with sessions.client.get(url,timeout=22)as response:
   response.raise_for_status();raw=response.content;mime=response.headers.get('Content-Type','').split(';')[0];final=response.url
  if len(raw)>20*1024*1024:raise ValueError('Image exceeds review limit')
  with Image.open(io.BytesIO(raw))as image:width,height=image.size;image.load()
  if not mime.startswith('image/')or width<500 or height<300:raise ValueError(f'Below existing source-photo quality floor: {width}x{height}')
  digest=hashlib.sha256(raw).hexdigest()
  if digest in rejected:raise ValueError(rejected[digest]['reason'])
  result={'ok':True,'width':width,'height':height,'contentType':mime,'sha256':hashlib.sha256(raw).hexdigest(),'finalUrl':final,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')}
  image_path.write_bytes(raw)
 except Exception as error:result={'ok':False,'error':str(error)}
 if result['ok']:p.write_text(json.dumps(result))
 return result
selected=[];evidence=dict(published['verifiedAssets']);failures=[];cursor=0
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
if len(selected)!=500:raise RuntimeError('Could not verify 500 new entries; published selection is untouched.')
active={queue[rid]['url']for rid in selected};new={'schema':1,'id':args.batch_id,'limit':500,'releaseIds':selected,'verifiedAssets':{u:evidence[u]for u in sorted(active)},'failures':failures,'note':'Additional 500 verified Tomica-family release photo references; prior batches remain active.'}
all_ids=published['releaseIds']+selected
out={'schema':2,'id':args.batch_id,'limit':len(all_ids),'releaseIds':all_ids,'verifiedAssets':{u:evidence[u]for u in sorted({queue[rid]['url']for rid in all_ids})},'failures':published.get('failures',[])+failures,'batches':batches+[{k:new[k]for k in ['id','limit','releaseIds']}],'note':'Cumulative reviewed photo selection. Each authorized batch adds 500 release entries; remaining discovered links stay queued.'}
archive=root/'catalog/input/catalog-image-batches';archive.mkdir(exist_ok=True)
def atomic_write(path,raw):
 fd,name=tempfile.mkstemp(dir=path.parent,prefix='.batch-')
 try:
  with os.fdopen(fd,'wb')as f:f.write(raw)
  os.replace(name,path)
 finally:
  if os.path.exists(name):os.unlink(name)
if published['schema']==1:
 old_path=archive/(published['id']+'.json')
 if old_path.exists()and old_path.read_bytes()!=original:raise ValueError('Original batch archive differs')
 if not old_path.exists():atomic_write(old_path,original)
new_path=archive/(args.batch_id+'.json')
if new_path.exists():raise ValueError('New batch archive exists; review before resuming')
atomic_write(new_path,(json.dumps(new,ensure_ascii=False,indent=2)+'\n').encode())
atomic_write(manifest,(json.dumps(out,ensure_ascii=False,indent=2)+'\n').encode())
print(f'Batch ready: {len(selected)} new releases, {len(all_ids)} cumulative, {len(active)} distinct new-batch sources, {len(failures)} skipped references.',flush=True)
