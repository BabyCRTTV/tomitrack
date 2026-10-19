#!/usr/bin/env python3
"""Scheduled public-data refresh. Never accesses private collections or credentials.
Known manufacturer records only: unchanged Tomica evidence hashes, exact TLV
source/title/price matches. Changed/ambiguous pages await review. No asking-price imports.
"""
from pathlib import Path
from datetime import datetime,timezone
import json,re,html,hashlib,unicodedata,urllib.request,concurrent.futures,xml.etree.ElementTree as ET,os
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text())
def norm(s):return re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
def parse_tlv(body,rows,known,now):
 byurl={s['url']:r for r in rows if r['id'] in known for s in r['sourceRefs']};out={}
 for block in re.findall(r'<li\b[^>]*>.*?</li>',json.loads(body)['dblineup_src'],re.S):
  link=re.search(r'href="(/product/detail.html\?id=\d+)"',block);price=re.search(r'価格[：:]\s*([\d,]+)円\s*[（(]税込[）)]',html.unescape(block));title=re.search(r'<h3[^>]*>(.*?)</h3>',block,re.S)
  if not(link and price and title):continue
  url='https://minicar.tomytec.co.jp'+link[1];r=byurl.get(url);name=html.unescape(re.sub('<[^>]+>','',title[1]));amount=int(price[1].replace(',',''))
  if r and norm(name)==norm(r['name']) and 0<amount<=10000000:
   x={**known[r['id']],'amount':amount,'observedAt':now}
   if r['id'] in out and out[r['id']]['amount']!=amount:raise ValueError('Conflicting manufacturer prices')
   out[r['id']]=x
 return out

def fetch(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'TomiTrack public pricing refresh (+https://github.com/BabyCRTTV/tomitrack)'}),timeout=25)as r:
  raw=r.read(10000001)
  if len(raw)>10000000:raise ValueError('Oversized public source')
  return raw

def main():
 now=datetime.now(timezone.utc).isoformat(timespec='seconds');rows=read('catalog/catalog.json')['releases'];tlv=read('catalog/input/tlv-prices.json');tomica=read('catalog/input/tomica-prices.json')
 previous=read('catalog/input/price-refresh.json') if (ROOT/'catalog/input/price-refresh.json').exists() else {};updates=dict(previous.get('msrp',{}));report=[]
 # FX is required: a failed/stale feed never republishes a stale snapshot as fresh.
 url=tlv['fx']['sourceUrl'];raw=fetch(url);tree=ET.fromstring(raw);dated=next(x for x in tree.iter()if 'time'in x.attrib);rates={x.attrib['currency']:float(x.attrib['rate'])for x in dated if 'currency'in x.attrib}
 assert 0<=(datetime.now(timezone.utc).date()-datetime.fromisoformat(dated.attrib['time']).date()).days<=10
 fx={'date':dated.attrib['time'],'usdPerEur':rates['USD'],'jpyPerEur':rates['JPY'],'sourceUrl':url};report.append({'sourceUrl':url,'sha256':hashlib.sha256(raw).hexdigest(),'status':'Verified reference rates'})
 url='https://minicar.tomytec.co.jp/product/api/search.php'
 try:
  raw=fetch(url);verified=parse_tlv(raw,rows,tlv['msrp'],now)
  if len(verified)<len(tlv['msrp'])*.9:raise ValueError('Unexpected manufacturer coverage drop')
  updates.update(verified);report.append({'sourceUrl':url,'sha256':hashlib.sha256(raw).hexdigest(),'verified':len(verified)})
 except Exception as e:report.append({'sourceUrl':url,'status':'Prior evidence retained; review needed','error':str(e)})
 def monthly(source):
  url=source['url']
  try:
   raw=fetch(url);digest=hashlib.sha256(raw).hexdigest();return url,digest,None
  except Exception as e:return url,None,str(e)
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
  for url,digest,error in pool.map(monthly,tomica['sources']):
   ids=[rid for rid,m in tomica['msrp'].items()if m['sourceUrl']==url and tomica['evidence'][rid]['sourceSha256']==digest]
   for rid in ids:updates[rid]={**tomica['msrp'][rid],'observedAt':now}
   report.append({'sourceUrl':url,'sha256':digest,'verified':len(ids),'status':'Exact reviewed page unchanged' if ids else 'Prior evidence retained; page needs review','error':error})
 # Observations remain immutable; sold count alone never becomes new transactions.
 out={'schema':1,'asOf':now,'fx':fx,'msrp':updates,'sources':report,'salesPolicy':'Only independently reviewed final-price, exact-variant/condition, precisely dated observations enter the sales overlay. No bulk sold provider is connected.'}
 path=ROOT/'catalog/input/price-refresh.json';temp=path.with_suffix('.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');os.replace(temp,path)
 print('Refreshed FX',fx['date'],'and',len(updates),'known MSRP records; unmatched sources preserved for review.')
if __name__=='__main__':main()
