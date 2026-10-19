#!/usr/bin/env python3
"""Scheduled public-data refresh. Never accesses private collections or credentials.
Known manufacturer records only: unchanged Tomica evidence hashes, exact TLV
source/title/price matches. Changed/ambiguous pages await review. Only reviewed exact listing identities can refresh asking prices.
"""
from pathlib import Path
from datetime import datetime,timezone
import json,re,html,hashlib,unicodedata,urllib.request,urllib.parse,concurrent.futures,xml.etree.ElementTree as ET,os
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

def fetch(url,fields=None):
 with urllib.request.urlopen(urllib.request.Request(url,data=urllib.parse.urlencode(fields).encode() if fields else None,headers={'User-Agent':'TomiTrack public pricing refresh (+https://github.com/BabyCRTTV/tomitrack)'}),timeout=25)as r:
  raw=r.read(10000001)
  if len(raw)>10000000:raise ValueError('Oversized public source')
  return raw


from html.parser import HTMLParser
from decimal import Decimal
class ListingPage(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.capture=None;self.scripts=[];self.text=[];self.price=[];self.stack=[];self.price_level=None
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
  if tag=='script' and a.get('type')=='application/ld+json':self.capture=[]
  if 'x-price-primary' in a.get('class','').split():self.price_level=len(self.stack)
 def handle_startendtag(self,tag,attrs):pass
 def handle_endtag(self,tag):
  if tag=='script' and self.capture is not None:self.scripts.append(''.join(self.capture));self.capture=None
  if self.price_level is not None and len(self.stack)==self.price_level:self.price_level=None
  if tag in self.stack:
   while self.stack.pop()!=tag:pass
 def handle_data(self,data):
  if self.capture is not None:self.capture.append(data)
  else:self.text.append(data)
  if self.price_level is not None:self.price.append(data)

def parse_listing(raw,watch,now):
 page=ListingPage();markup=raw.decode('utf-8');page.feed(markup);text=' '.join(page.text)
 if watch['sellerProfile'] not in markup:raise ValueError('Seller profile changed or unavailable')
 products=[x for x in (json.loads(s) for s in page.scripts) if isinstance(x,dict) and x.get('@type')=='Product']
 if len(products)!=1:raise ValueError('Missing unambiguous structured product')
 product=products[0];offer=product.get('offers',{})
 if norm(html.unescape(product.get('name','')))!=norm(watch['title']) or offer.get('url')!=watch['sourceUrl']:raise ValueError('Listing identity changed')
 if offer.get('itemCondition')!=watch['sourceCondition']:raise ValueError('Listing condition changed')
 if offer.get('availability')!='https://schema.org/InStock' or 'This listing sold' in text or 'This listing ended' in text:return None
 if 'Buy It Now' not in text:raise ValueError('No fixed-price purchase option')
 match=re.search(r'US \$([\d,.]+)',''.join(page.price))
 if offer.get('priceCurrency')!='USD' or not match:raise ValueError('No explicit USD item ask')
 amount=Decimal(offer['price']);visible=Decimal(match[1].replace(',',''))
 if amount!=visible or amount<=0 or amount>10000000:raise ValueError('Price mismatch')
 return {'releaseId':watch['releaseId'],'productCode':watch['productCode'],'sourceUrl':watch['sourceUrl'],'condition':watch['condition'],'amountCents':int(amount*100),'currency':'USD','observedAt':now,'verified':True,'lotSize':1,'active':True,'sellerId':watch['sellerId']}

def main():
 now=datetime.now(timezone.utc).isoformat(timespec='seconds');rows=read('catalog/catalog.json')['releases'];tlv=read('catalog/input/tlv-prices.json');tomica=read('catalog/input/tomica-prices.json')
 listing_input=read('catalog/input/price-listings.json')
 previous=read('catalog/input/price-refresh.json') if (ROOT/'catalog/input/price-refresh.json').exists() else {};updates=dict(previous.get('msrp',{}));report=[]
 # FX is required: a failed/stale feed never republishes a stale snapshot as fresh.
 url=tlv['fx']['sourceUrl'];raw=fetch(url);tree=ET.fromstring(raw);dated=next(x for x in tree.iter()if 'time'in x.attrib);rates={x.attrib['currency']:float(x.attrib['rate'])for x in dated if 'currency'in x.attrib}
 assert 0<=(datetime.now(timezone.utc).date()-datetime.fromisoformat(dated.attrib['time']).date()).days<=10
 fx={'date':dated.attrib['time'],'usdPerEur':rates['USD'],'jpyPerEur':rates['JPY'],'sourceUrl':url};report.append({'sourceUrl':url,'sha256':hashlib.sha256(raw).hexdigest(),'status':'Verified reference rates'})
 url='https://minicar.tomytec.co.jp/product/api/search.php'
 try:
  raw=fetch(url,{'keyword':'','yyyy':'','mm':'','series':'','scale':'','release':'','maker':'','dataType':'all','sorts':'','page':200});verified=parse_tlv(raw,rows,tlv['msrp'],now)
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
 # Watch only independently reviewed exact listing identities.
 listings=list(previous.get('listings',listing_input['observations']))
 for watch in listing_input['watches']:
  url=watch['sourceUrl']
  try:
   raw=fetch(url);updated=parse_listing(raw,watch,now)
   if updated is None:
    for x in listings:
     if x['sourceUrl']==url:x['active']=False
    status='Listing unavailable; no sale inferred'
   else:listings.append(updated);status='Exact reviewed listing refreshed'
   report.append({'sourceUrl':url,'sha256':hashlib.sha256(raw).hexdigest(),'status':status})
  except Exception as e:report.append({'sourceUrl':url,'status':'Prior dated listing retained; no fresh observation','error':str(e)})
 cutoff=datetime.now(timezone.utc).timestamp()-180*86400
 listings=[x for x in listings if datetime.fromisoformat(x['observedAt'].replace('Z','+00:00')).timestamp()>=cutoff]
 out={'schema':1,'asOf':now,'fx':fx,'msrp':updates,'listings':listings,'sources':report,'salesPolicy':'Verified sold averages take priority. Three independent current asks, then historical asks, precede the MSRP fallback. Exact reviewed listing watches refresh automatically; new sold transactions require final-price/date/variant review. No bulk sold provider is connected.'}
 path=ROOT/'catalog/input/price-refresh.json';temp=path.with_suffix('.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');os.replace(temp,path)
 print('Refreshed FX',fx['date'],'and',len(updates),'known MSRP records; unmatched sources preserved for review.')
if __name__=='__main__':main()
