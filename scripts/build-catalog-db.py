#!/usr/bin/env python3
"""Build the portable public catalog from its validated, normalized JSON projection."""
import argparse,json,sqlite3,tempfile,os
from pathlib import Path
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--output',default=str(root/'artifacts/TomiTrack-catalog.sqlite'));args=parser.parse_args()
data=json.loads((root/'catalog/catalog.json').read_text());english=json.loads((root/'catalog/input/tomica-english.json').read_text())['translations'];media=json.loads((root/'catalog/input/catalog-images.json').read_text())['images'];dest=Path(args.output);dest.parent.mkdir(parents=True,exist_ok=True)
batch=json.loads((root/'catalog/input/catalog-image-batch.json').read_text());active_ids=set(batch['releaseIds']);assert batch['schema']==2 and batch['limit']==1500 and len(active_ids)==len(batch['releaseIds'])==1500
batch_ids=[rid for b in batch['batches']for rid in b['releaseIds']];assert len(batch['batches'])==3 and all(b['limit']==len(b['releaseIds'])==500 for b in batch['batches']);assert batch_ids==batch['releaseIds'] and len(set(batch_ids))==1500
for b in batch['batches']:
 assert b['id']in ['2026-10-17-001','2026-10-18-002','2026-10-18-003'];assert json.loads((root/'catalog/input/catalog-image-batches'/(b['id']+'.json')).read_text())['releaseIds']==b['releaseIds']
rejected=json.loads((root/'catalog/input/catalog-image-rejections.json').read_text())['rejectedHashes'];assert all(batch['verifiedAssets'][media[rid]['url']]['sha256'] not in rejected for rid in active_ids)
media={k:v for k,v in media.items()if k in active_ids};assert len(media)==1500 and all(batch['verifiedAssets'].get(v['url'],{}).get('ok') for v in media.values())
release_by_id={r['id']:r for r in data['releases']}
for rid,image in media.items():
 if image['kind']=='casting-reference':
  reference=release_by_id[image['referenceReleaseId']];assert reference['castingId']==release_by_id[rid]['castingId'];assert any(ref.get('url')==image['sourceUrl']for ref in reference['sourceRefs'])
fd,temp=tempfile.mkstemp(prefix='catalog-',suffix='.sqlite',dir=dest.parent);os.close(fd)
try:
 db=sqlite3.connect(temp);db.execute('PRAGMA foreign_keys=ON');db.executescript('''
 CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
 CREATE TABLE brands(id TEXT PRIMARY KEY,name TEXT NOT NULL);
 CREATE TABLE castings(id TEXT PRIMARY KEY,brand_id TEXT NOT NULL REFERENCES brands(id),name TEXT NOT NULL);
 CREATE TABLE casting_aliases(casting_id TEXT NOT NULL REFERENCES castings(id),alias TEXT NOT NULL,PRIMARY KEY(casting_id,alias));
 CREATE TABLE series(id TEXT PRIMARY KEY,brand_id TEXT NOT NULL REFERENCES brands(id),year INTEGER NOT NULL,category_id TEXT NOT NULL,name TEXT NOT NULL,family TEXT NOT NULL);
 CREATE TABLE releases(id TEXT PRIMARY KEY,casting_id TEXT NOT NULL REFERENCES castings(id),series_id TEXT NOT NULL REFERENCES series(id),brand_id TEXT NOT NULL REFERENCES brands(id),name TEXT NOT NULL,year INTEGER NOT NULL,category_id TEXT NOT NULL,product_code TEXT,man_number TEXT,collector_number TEXT,series_number TEXT,color TEXT,variant TEXT,regions TEXT NOT NULL,tags TEXT NOT NULL,aliases TEXT NOT NULL,release_date TEXT NOT NULL,scale TEXT NOT NULL);
 CREATE TABLE release_english(release_id TEXT PRIMARY KEY REFERENCES releases(id),name TEXT NOT NULL,color TEXT NOT NULL,series_name TEXT NOT NULL,review_required INTEGER NOT NULL);
 CREATE TABLE release_images(release_id TEXT PRIMARY KEY REFERENCES releases(id),url TEXT NOT NULL,source_url TEXT NOT NULL,credit TEXT NOT NULL,kind TEXT NOT NULL,original_url TEXT NOT NULL,fallback_url TEXT NOT NULL,reference_release_id TEXT REFERENCES releases(id));
 CREATE TABLE sources(id TEXT PRIMARY KEY,name TEXT NOT NULL,url TEXT NOT NULL,details TEXT NOT NULL);
 CREATE TABLE release_sources(release_id TEXT NOT NULL REFERENCES releases(id),source_id TEXT NOT NULL REFERENCES sources(id),reference TEXT NOT NULL,PRIMARY KEY(release_id,source_id,reference));
 CREATE TABLE identifiers(id INTEGER PRIMARY KEY,value TEXT NOT NULL,gtin14 TEXT NOT NULL,scope TEXT NOT NULL CHECK(scope IN ('release','assortment')),brand_id TEXT REFERENCES brands(id),category_id TEXT,source_id TEXT NOT NULL REFERENCES sources(id),note TEXT NOT NULL,source_url TEXT NOT NULL);
 CREATE TABLE release_identifiers(release_id TEXT NOT NULL REFERENCES releases(id),identifier_id INTEGER NOT NULL REFERENCES identifiers(id),PRIMARY KEY(release_id,identifier_id));
 CREATE TABLE coverage(brand_id TEXT NOT NULL REFERENCES brands(id),year INTEGER NOT NULL,releases INTEGER NOT NULL,status TEXT NOT NULL,details TEXT NOT NULL,PRIMARY KEY(brand_id,year));
 CREATE INDEX release_filters ON releases(brand_id,year,category_id);
 CREATE INDEX release_casting ON releases(casting_id);
 CREATE INDEX release_series ON releases(series_id);
 CREATE INDEX release_product ON releases(product_code);
 CREATE INDEX release_collector ON releases(collector_number);
 CREATE INDEX identifier_gtin ON identifiers(gtin14);
 CREATE VIRTUAL TABLE release_search USING fts5(release_id UNINDEXED,name,brand,series,year,product_code,collector_number,series_number,man_number,color,variant,aliases,tokenize='unicode61 remove_diacritics 2');
 ''')
 for key in ['schema','version','builtAt','scope']:db.execute('INSERT INTO metadata VALUES (?,?)',(key,json.dumps(data[key])))
 for x in data['brands']:db.execute('INSERT INTO brands VALUES (?,?)',(x['id'],x['name']))
 for x in data['castings']:
  db.execute('INSERT INTO castings VALUES (?,?,?)',(x['id'],x['brandId'],x['name']))
  for alias in x['aliases']:db.execute('INSERT INTO casting_aliases VALUES (?,?)',(x['id'],alias))
 for x in data['series']:db.execute('INSERT INTO series VALUES (?,?,?,?,?,?)',(x['id'],x['brandId'],x['year'],x['categoryId'],x['name'],x['family']))
 for x in data['sources']:db.execute('INSERT INTO sources VALUES (?,?,?,?)',(x['id'],x['name'],x['url'],json.dumps(x)))
 series={x['id']:x for x in data['series']};brands={x['id']:x['name']for x in data['brands']}
 for x in data['releases']:
  db.execute('INSERT INTO releases VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(x['id'],x['castingId'],x['seriesId'],x['brandId'],x['name'],x['year'],x['categoryId'],x['productCode'],x['manNumber'],x['collectorNumber'],x['seriesNumber'],x['color'],x['variant'],json.dumps(x['regions']),json.dumps(x['tags']),json.dumps(x.get('aliases',[])),x.get('releaseDate',''),x.get('scale','')))
  en={k:english.get(v,{}).get('text',v) for k,v in {'name':x['name'],'color':x['color'],'seriesName':series[x['seriesId']]['name']}.items()}
  db.execute('INSERT INTO release_search VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',(x['id'],en['name'],brands[x['brandId']],en['seriesName'],str(x['year']),x['productCode'],x['collectorNumber'],x['seriesNumber'],x['manNumber'],en['color'],x['variant'],' '.join([x['name'],series[x['seriesId']]['name'],x['color'],*x.get('aliases',[])])))
  for ref in x['sourceRefs']:db.execute('INSERT INTO release_sources VALUES (?,?,?)',(x['id'],ref['sourceId'],json.dumps(ref,sort_keys=True)))
 for x in data['releases']:
  if x['brandId'].startswith('tomica'):
   fields=[x['name'],x['color'],series[x['seriesId']]['name']];values=[english.get(v,{}).get('text',v)for v in fields]
   db.execute('INSERT INTO release_english VALUES (?,?,?,?,?)',(x['id'],*values,int(any(english.get(v,{}).get('reviewRequired')for v in fields))))
 for rid,x in media.items():db.execute('INSERT INTO release_images VALUES (?,?,?,?,?,?,?,?)',(rid,x['url'],x['sourceUrl'],x['credit'],x['kind'],x.get('originalUrl',''),x.get('fallbackUrl',''),x.get('referenceReleaseId')))
 for i,x in enumerate(data['identifiers'],1):
  gtin=''.join(c for c in x['value']if c.isdigit()).zfill(14)
  db.execute('INSERT INTO identifiers VALUES (?,?,?,?,?,?,?,?,?)',(i,x['value'],gtin,x['scope'],x.get('brandId'),x.get('categoryId'),x['sourceId'],x.get('note',''),x['sourceUrl']))
  for rid in x.get('releaseIds',[]):db.execute('INSERT INTO release_identifiers VALUES (?,?)',(rid,i))
 for x in data['coverage']:db.execute('INSERT INTO coverage VALUES (?,?,?,?,?)',(x['brandId'],x['year'],x['releases'],x['status'],json.dumps(x)))
 assert not db.execute('PRAGMA foreign_key_check').fetchall()
 assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
 db.commit();db.execute('VACUUM');count=db.execute('SELECT count(*) FROM releases').fetchone()[0];db.close();os.replace(temp,dest);print(f'Built {dest.name}: {count} releases; foreign keys, FTS5 and integrity checks pass.')
finally:
 if Path(temp).exists():Path(temp).unlink()
