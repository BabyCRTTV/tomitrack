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
 def __init__(self):super().__init__(convert_charrefs=True);self.capture=None;self.scripts=[];self.text=[];self.price=[];self.stack=[];self.price_level=None;self.script=False;self.seller_level=None;self.seller_links=[];self.seller_ids=[];self.condition_level=None;self.condition_text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
  if tag=='script':
   self.script=True
   if a.get('type')=='application/ld+json':self.capture=[]
  if {'x-price-primary','x-price-approx'} & set(a.get('class','').split()):self.price_level=len(self.stack)
  if a.get('data-testid')=='x-sellercard-atf':self.seller_level=len(self.stack)
  if 'x-item-condition' in a.get('class','').split():self.condition_level=len(self.stack)
  if tag=='a' and self.seller_level is not None:
   self.seller_links.append(a.get('href','').split('?')[0])
  if self.seller_level is not None and a.get('data-clientpresentationmetadata'):
   try:
    seller=json.loads(a['data-clientpresentationmetadata']).get('_ssn')
    if seller:self.seller_ids.append(seller.lower())
   except (ValueError,TypeError):pass
 def handle_startendtag(self,tag,attrs):pass
 def handle_endtag(self,tag):
  if tag=='script' and self.capture is not None:self.scripts.append(''.join(self.capture));self.capture=None
  if tag=='script':self.script=False
  if self.price_level is not None and len(self.stack)==self.price_level:self.price_level=None
  if self.seller_level is not None and len(self.stack)==self.seller_level:self.seller_level=None
  if self.condition_level is not None and len(self.stack)==self.condition_level:self.condition_level=None
  if tag in self.stack:
   while self.stack.pop()!=tag:pass
 def handle_data(self,data):
  if self.capture is not None:self.capture.append(data)
  elif not self.script:self.text.append(data)
  if self.price_level is not None:self.price.append(data)
  if self.condition_level is not None:self.condition_text.append(data)

def parse_listing(raw,watch,now):
 page=ListingPage();markup=raw.decode('utf-8');page.feed(markup);text=' '.join(page.text)
 if watch['sellerProfile'] not in page.seller_links:raise ValueError('Actual item seller changed or unavailable')
 if watch.get('sellerAccount') and set(page.seller_ids)!={watch['sellerAccount'].lower()}:raise ValueError('Actual seller account changed')
 products=[x for x in (json.loads(s) for s in page.scripts) if isinstance(x,dict) and x.get('@type')=='Product']
 if len(products)!=1:raise ValueError('Missing unambiguous structured product')
 product=products[0];offer=product.get('offers',{})
 if norm(html.unescape(product.get('name','')))!=norm(watch['title']) or offer.get('url')!=watch['sourceUrl']:raise ValueError('Listing identity changed')
 if offer.get('itemCondition')!=watch['sourceCondition']:raise ValueError('Listing condition changed')
 if offer.get('availability')!='https://schema.org/InStock' or re.search(r'This listing (?:sold|ended|was ended)',text,re.I):return None
 condition_text=' '.join(page.condition_text)
 if re.search(r'\b(scratches?|dirt|broken|missing|damaged|repainted|customized|junk)\b',condition_text,re.I):raise ValueError('Condition quality needs review')
 if 'Buy It Now' not in text:raise ValueError('No fixed-price purchase option')
 match=re.search(r'US \$([\d,.]+)',''.join(page.price))
 if offer.get('priceCurrency')!='USD' or not match:raise ValueError('No explicit USD item ask')
 amount=Decimal(offer['price']);visible=Decimal(match[1].replace(',',''))
 if amount!=visible or amount<=0 or amount>10000000:raise ValueError('Price mismatch')
 return {'releaseId':watch['releaseId'],'productCode':watch['productCode'],'sourceUrl':watch['sourceUrl'],'condition':watch['condition'],'amountCents':int(amount*100),'currency':'USD','observedAt':now,'verified':True,'lotSize':1,'active':True,'sellerId':watch['sellerId']}

def merge_listing_history(*histories):
 rows={}
 for history in histories:
  for x in history:
   key=(x['sourceUrl'],x['observedAt']);old=rows.get(key)
   if old and any(old[k]!=x[k] for k in ['releaseId','productCode','amountCents','condition','sellerId']):raise ValueError('Conflicting reviewed listing observation')
   rows[key]=dict(x)
 return list(rows.values())

def mark_unavailable(listings,url,now):
 prior=max((x for x in listings if x['sourceUrl']==url),key=lambda x:x['observedAt'],default=None)
 if prior:
  listings.append({**prior,'observedAt':now,'priceObservedAt':prior.get('priceObservedAt',prior['observedAt']),'active':False})

def refresh_watches(watches,listings,now,fetcher=fetch):
 # Read at most three public pages at once; apply observations in watch order.
 # Workers never mutate shared history, and one unavailable source cannot erase others.
 def inspect(watch):
  url=watch['sourceUrl']
  try:
   raw=fetcher(url);updated=parse_listing(raw,watch,now)
   return {'sourceUrl':url,'sha256':hashlib.sha256(raw).hexdigest(),'status':'Listing unavailable; no sale inferred' if updated is None else 'Exact reviewed listing refreshed'},updated
  except Exception as e:return {'sourceUrl':url,'status':'Prior dated listing retained; no fresh observation','error':str(e)},None
 report=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
  for result,updated in pool.map(inspect,watches):
   if 'error'not in result:
    if updated is None:mark_unavailable(listings,result['sourceUrl'],now)
    else:listings.append(updated)
   report.append(result)
 return report

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
 listings=merge_listing_history(listing_input['observations'],previous.get('listings',[]))
 report.extend(refresh_watches(listing_input['watches'],listings,now))
 cutoff=datetime.now(timezone.utc).timestamp()-180*86400
 listings=[x for x in listings if datetime.fromisoformat(x.get('priceObservedAt',x['observedAt']).replace('Z','+00:00')).timestamp()>=cutoff]
 out={'schema':1,'asOf':now,'fx':fx,'msrp':updates,'listings':listings,'sources':report,'salesPolicy':'Verified sold averages take priority. Three independent current asks, then historical asks, precede the MSRP fallback. Exact reviewed listing watches refresh automatically; new sold transactions require final-price/date/variant review. No bulk sold provider is connected.'}
 path=ROOT/'catalog/input/price-refresh.json';temp=path.with_suffix('.tmp');temp.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');os.replace(temp,path)
 print('Refreshed FX',fx['date'],'and',len(updates),'known MSRP records; unmatched sources preserved for review.')
if __name__=='__main__':main()
