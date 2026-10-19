#!/usr/bin/env python3
"""Manual owner research only: save public eBay candidates for review, never activate prices.
Usage: python3 scripts/research-price-listings.py urls.json scratch_directory
The input is an array of exact public item URLs. No login, credentials or collection data.
"""
from pathlib import Path
from datetime import datetime,timezone
import argparse,json,re,hashlib,concurrent.futures,importlib.util
spec=importlib.util.spec_from_file_location('refresh',Path(__file__).with_name('refresh-prices.py'));refresh=importlib.util.module_from_spec(spec);spec.loader.exec_module(refresh)

def main():
 ap=argparse.ArgumentParser();ap.add_argument('urls');ap.add_argument('output');a=ap.parse_args();dest=Path(a.output);dest.mkdir(parents=True,exist_ok=True);urls=json.loads(Path(a.urls).read_text())
 if not isinstance(urls,list) or len(urls)>250 or any(not re.fullmatch(r'https://www\.ebay\.com/itm/\d{12}',u)for u in urls):raise ValueError('Expected up to 250 exact HTTPS eBay item URLs')
 def inspect(url):
  try:
   raw=refresh.fetch(url);p=refresh.ListingPage();p.feed(raw.decode('utf-8'));products=[x for x in (json.loads(s)for s in p.scripts)if isinstance(x,dict)and x.get('@type')=='Product']
   if len(products)!=1:raise ValueError('No single product; challenge/unavailable pages are not bypassed')
   product=products[0];offer=product.get('offers',{});id=url.rsplit('/',1)[1];(dest/(id+'.html')).write_bytes(raw)
   out={'sourceUrl':url,'title':product.get('name',''),'offer':offer,'images':product.get('image',[]),'sellerProfiles':list(dict.fromkeys(p.seller_links)),'sellerAccounts':sorted(set(p.seller_ids)),'conditionText':' '.join(p.condition_text),'observedAt':datetime.now(timezone.utc).isoformat(timespec='seconds'),'sha256':hashlib.sha256(raw).hexdigest(),'reviewRequired':True}
   (dest/(id+'.json')).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');return {k:out[k]for k in ['sourceUrl','title','conditionText']}
  except Exception as e:return {'sourceUrl':url,'error':str(e),'reviewRequired':True}
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
  results=list(pool.map(inspect,dict.fromkeys(urls)))
 (dest/'research-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');print(json.dumps(results,ensure_ascii=False))
if __name__=='__main__':main()
