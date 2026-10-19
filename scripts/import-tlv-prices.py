#!/usr/bin/env python3
"""Manual evidence import; never fetches during startup, tests or release builds."""
import json,re,html,hashlib,unicodedata,xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime,timezone
root=Path(__file__).resolve().parents[1];cache=root/'.cache/pricing'
rows=json.loads((root/'catalog/catalog.json').read_text())['releases'];by_url={ref['url']:r for r in rows if r['brandId']=='tomica-limited-vintage' for ref in r['sourceRefs']}
body=(cache/'tomytec.json').read_bytes();markup=json.loads(body)['dblineup_src'];now=datetime.now(timezone.utc).isoformat(timespec='seconds');msrp={};excluded=[]
normalize=lambda s:re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
for block in re.findall(r'<li\b[^>]*>.*?</li>',markup,re.S):
 link=re.search(r'href="(/product/detail.html\?id=\d+)"',block);price=re.search(r'価格[：:]\s*([\d,]+)円\s*[（(]税込[）)]',html.unescape(block));title=re.search(r'<h3[^>]*>(.*?)</h3>',block,re.S)
 if not(link and price and title):continue
 url='https://minicar.tomytec.co.jp'+link[1];r=by_url.get(url);name=html.unescape(re.sub('<[^>]+>','',title[1])).strip()
 if not r or normalize(name)!=normalize(r['name']):continue
 amount=int(price[1].replace(',',''))
 if amount<=0:excluded.append({'releaseId':r['id'],'sourceUrl':url,'reason':'Manufacturer lists zero, not a usable MSRP.'});continue
 msrp[r['id']]={'amount':amount,'currency':'JPY','taxIncluded':True,'sourceUrl':url,'observedAt':now}
xml=(cache/'ecb.xml').read_bytes();tree=ET.fromstring(xml);dated=next(x for x in tree.iter()if 'time'in x.attrib);rates={x.attrib['currency']:float(x.attrib['rate'])for x in dated if 'currency'in x.attrib}
fx={'date':dated.attrib['time'],'usdPerEur':rates['USD'],'jpyPerEur':rates['JPY'],'sourceUrl':'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'}
sales=[];e=(cache/'ebay.html').read_text();evidence=[]
# A single fixed-price observation is retained as evidence, never multiplied by "2 sold".
if '2026-08-17T00:58:36.000Z'in e and '29.90'in e and 'LV-N305e'in e:
 sales=[{'releaseId':'tm-42ea089ca5b11344c9b7','productCode':'LV-N305e','sourceUrl':'https://www.ebay.com/itm/407129078483','condition':'Sealed','amountCents':2990,'currency':'USD','soldAt':'2026-08-17','verified':True,'finalPriceKnown':True,'lotSize':1,'shippingExcluded':True,'saleType':'fixed-price','observedAt':now}]
 evidence=[{'sourceUrl':sales[0]['sourceUrl'],'sha256':hashlib.sha256((cache/'ebay.html').read_bytes()).hexdigest(),'review':'Sold banner, fixed USD price, original UTC endDate, exact LV-N305e purple variant and New condition reviewed. One listing is one observation; shipping excluded.'}]
data={'schema':1,'brandId':'tomica-limited-vintage','asOf':now,'msrp':msrp,'sales':sales,'fx':fx,'evidence':{'msrp':{'sourceUrl':'https://minicar.tomytec.co.jp/product/api/search.php','sha256':hashlib.sha256(body).hexdigest(),'method':'Canonical detail URL and full Japanese title match, with Unicode width/whitespace normalized. Positive explicitly tax-inclusive manufacturer price only.'},'fxSha256':hashlib.sha256(xml).hexdigest(),'sales':evidence},'excludedMsrp':excluded,'excludedSales':[{'sourceUrl':'https://www.ebay.com/itm/287120519751','reason':'Used-condition mapping and actual Best Offer price not independently confirmed.'},{'sourceUrl':'https://www.ebay.com/itm/376571506061','reason':'Ended by seller; not confirmed sold.'}],'marketAccess':'Bulk eBay Marketplace Insights access is restricted. Public search required CAPTCHA; no bypass attempted. Sparse observations are not a reliable average.'}
(root/'catalog/input/tlv-prices.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print('Imported MSRP:',len(msrp),'sales:',len(sales),'FX:',fx)
