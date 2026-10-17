#!/usr/bin/env python3
"""Prepare display-only English using editorial terminology and explicit romanization.
Never rewrites source facts or IDs. Unknown terms are retained phonetically and queued
for terminology review, rather than filled with unverified machine-model guesses.
Run manually with pykakasi 2.3.0, then review catalog/input/tomica-english.json.
"""
import json,re,unicodedata,collections
from pathlib import Path
from pykakasi import kakasi
ROOT=Path(__file__).resolve().parents[1];data=json.loads((ROOT/'catalog/catalog.json').read_text())
terms=dict(json.loads((ROOT/'catalog/input/tomica-english-glossary.json').read_text())['terms'])
pattern=re.compile('|'.join(re.escape(k)for k in sorted(terms,key=len,reverse=True)))
jp=re.compile('[\u3040-\u30ff\u3400-\u9fffー]+');romanizer=kakasi();review=collections.Counter()
def english(s):
 residual=[]
 def romanize(m):
  text=m[0]
  if text=='・':return ' '
  residual.append(text);review[text]+=1
  return ' '+' '.join(x['hepburn']for x in romanizer.convert(text)).title()+' '
 protected=pattern.sub(lambda m:' '+terms[m[0]]+' ',unicodedata.normalize('NFKC',s));out=jp.sub(romanize,protected)
 out=out.replace('・',' ').replace('「','').replace('」','').replace('『','').replace('』','');out=re.sub(r'\s+',' ',out).strip();out=re.sub(r'\(\s+','(',out);out=re.sub(r'\s+\)',')',out)
 return {'text':out,'method':'glossary-and-romanization' if residual else 'editorial-glossary','reviewRequired':bool(residual),'residualPhrases':residual}
texts={r['name']for r in data['releases']if r['brandId'].startswith('tomica')};texts.update(r['color']for r in data['releases']if r['brandId'].startswith('tomica'));texts.update(s['name']for s in data['series']if s['brandId'].startswith('tomica'))
values={s:english(s)for s in sorted(texts)if s}
result={'schema':1,'language':'en','note':'Editorial English terminology. Unreviewed residual proper names/phrases are romanized and explicitly queued for review; these are not official manufacturer translations. Original Japanese facts remain unchanged.','romanizer':{'id':'pykakasi','version':'2.3.0','scope':'Manual data preparation only; not distributed in the application.'},'translations':values}
(ROOT/'catalog/input/tomica-english.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
(ROOT/'catalog/input/tomica-translation-review.json').write_text(json.dumps({'remainingTerms':len(review),'entries':sorted(({'japanese':k,'occurrences':v}for k,v in review.items()),key=lambda x:(-x['occurrences'],x['japanese']))},ensure_ascii=False,indent=2)+'\n')
print('Saved',len(values),'English display entries;',sum(x['reviewRequired']for x in values.values()),'contain romanized terminology queued for review.')
