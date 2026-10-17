#!/usr/bin/env python3
"""Manual translation preparation; pinned local Marian model, reviewed terminology first.
No network translation in builds/startup. Review generated English before committing.
"""
import json,re,unicodedata,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];data=json.loads((ROOT/'catalog/catalog.json').read_text())
terms=dict(json.loads((ROOT/'catalog/input/tomica-english-glossary.json').read_text())['terms'])
pattern=re.compile('|'.join(re.escape(k)for k in sorted(terms,key=len,reverse=True)))
jp=re.compile('[\u3040-\u30ff\u3400-\u9fffー]+')
def protect(s):return pattern.sub(lambda m:' '+terms[m[0]]+' ',unicodedata.normalize('NFKC',s))
texts={r['name'] for r in data['releases'] if r['brandId'].startswith('tomica')}
texts.update(r['color'] for r in data['releases'] if r['brandId'].startswith('tomica'))
texts.update(s['name']for s in data['series']if s['brandId'].startswith('tomica'))
chunks=collections.Counter(c for s in texts for c in jp.findall(protect(s)) if c not in ['・'])
p=ROOT/'.cache/tomica-machine-terms.json';translated=json.loads(p.read_text()) if p.exists()else {}
missing=[c for c in chunks if c not in translated]
print('Unique texts:',len(texts),'Residual phrases:',len(chunks),'To translate:',len(missing),flush=True)
if missing:
 import torch
 from transformers import MarianTokenizer,MarianMTModel
 torch.set_num_threads(4)
 path=ROOT/'.cache/translation-model';tok=MarianTokenizer.from_pretrained(path);model=MarianMTModel.from_pretrained(path);model.eval()
 for i in range(0,len(missing),16):
  batch=missing[i:i+16];inputs=tok(batch,return_tensors='pt',padding=True,truncation=True,max_length=192)
  with torch.inference_mode():out=model.generate(**inputs,max_new_tokens=64,num_beams=2)
  for a,b in zip(batch,tok.batch_decode(out,skip_special_tokens=True)):translated[a]=b.strip().removesuffix('.')
  p.write_text(json.dumps(translated,ensure_ascii=False))
  if i%160==0:print('Translated',i+len(batch),'/',len(missing),flush=True)
# Output separate from canonical facts; every machine-assisted entry is marked for review.
def english(s):
 protected=protect(s);used=[c for c in jp.findall(protected) if c!='・']
 out=jp.sub(lambda m:' '+(translated.get(m[0],'-' if m[0]=='・' else m[0]))+' ',protected)
 out=re.sub(r'\s+',' ',out).strip();out=re.sub(r'\(\s+','(',out);out=re.sub(r'\s+\)',')',out)
 return {'text':out,'method':'machine-assisted' if used else 'glossary','reviewRequired':bool(used),'residualPhrases':used}
values={s:english(s) for s in sorted(texts) if s}
result={'schema':1,'language':'en','model':{'id':'Helsinki-NLP/opus-mt-ja-en','revision':'0770961a39ba6bd66305b149c3f4110bcafca2e6','license':'Apache-2.0'},'note':'Editorial glossary plus machine-assisted translation; original Japanese facts retained. Machine-assisted entries require terminology review; not official manufacturer translations.','translations':values}
(ROOT/'catalog/input/tomica-english.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
(ROOT/'.cache/tomica-translation-review.json').write_text(json.dumps(sorted(((c,chunks[c],translated.get(c))for c in chunks),key=lambda x:-x[1]),ensure_ascii=False,indent=2))
print('Saved',len(values),'translations;',sum(x['reviewRequired']for x in values.values()),'require terminology review',flush=True)
