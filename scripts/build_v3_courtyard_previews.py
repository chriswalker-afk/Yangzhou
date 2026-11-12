#!/usr/bin/env python3
"""Build lightweight, source-traceable V3 courtyard preview artwork.

These files are *preview derivatives*. The genuine lossless WebPs remain
unchanged in assets/v3/{materials,edges,large,enclosures}. This keeps the
experimental mobile/browser lab responsive on low-bandwidth connections.

Usage: python scripts/build_v3_courtyard_previews.py [--check]
"""
from __future__ import annotations
from pathlib import Path
import argparse
import hashlib
import io
import json
from PIL import Image, features

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/v3/previews"
SOURCE_FILES=[
 ("materials/grass-01-lossless.webp", "grass.webp", None),
 ("materials/stone-01-lossless.webp", "stone.webp", None),
 ("materials/water-01-lossless.webp", "water.webp", None),
 ("edges/canal-bank-edge-01.webp", "canal-bank-edge.webp", 1024),
 ("edges/path-verge-edge-01.webp", "path-verge-edge.webp", 1024),
 ("large/courtyard-hall-01.webp", "courtyard-hall.webp", 768),
 ("large/willow-tree-01.webp", "willow-tree.webp", 768),
 ("large/garden-rockery-01.webp", "garden-rockery.webp", 768),
 ("enclosures/white-garden-wall-long-01.webp", "white-garden-wall-long.webp", 1024),
 ("enclosures/white-garden-wall-short-01.webp", "white-garden-wall-short.webp", 768),
 ("enclosures/white-garden-wall-corner-01.webp", "white-garden-wall-corner.webp", 768),
 ("enclosures/moon-gate-01.webp", "moon-gate.webp", 768),
]
QUALITY=91
def digest(data):return hashlib.sha256(data).hexdigest()
def make_preview():
 if not features.check("webp"):raise SystemExit("Pillow must support WebP")
 rows={}
 for relative,name,max_side in SOURCE_FILES:
  source=ROOT/"assets/v3"/relative
  original=source.read_bytes()
  with Image.open(io.BytesIO(original)) as opened:
   image=opened.convert("RGBA")
  old_width,old_height=image.size
  if max_side and max(image.size)>max_side:
   scale=max_side/max(image.size)
   image=image.resize((round(image.width*scale),round(image.height*scale)),Image.Resampling.LANCZOS)
  # High quality WEBP with lossless alpha. RGBA master remains untouched.
  mem=io.BytesIO()
  image.save(mem,format="WEBP",quality=QUALITY,method=6,exact=True)
  data=mem.getvalue()
  if not data.startswith(b"RIFF") or data[8:12]!=b"WEBP":
   raise RuntimeError("WEBP encoding failed for "+name)
  path=OUT/name
  rows[name]={
   "source":"assets/v3/"+relative,
   "sourceSha256":digest(original),
   "sourceBytes":len(original),
   "sourceDimensions":[old_width,old_height],
   "preview":"assets/v3/previews/"+name,
   "previewSha256":digest(data),
   "previewBytes":len(data),
   "previewDimensions":list(image.size)
  }
  yield path,data,rows
def main():
 parser=argparse.ArgumentParser()
 parser.add_argument("--check",action="store_true")
 opts=parser.parse_args()
 OUT.mkdir(parents=True,exist_ok=True)
 for path,data,_ in make_preview():
  if opts.check:
   if not path.is_file() or path.read_bytes()!=data:
    raise SystemExit("Missing or stale V3 preview: "+str(path.relative_to(ROOT)))
  else:
   path.write_bytes(data)
   print(f"Prepared {path.relative_to(ROOT)} ({len(data):,} bytes)")
 rows={}
 for path,data,snapshot in make_preview():
  rows={k:v for k,v in snapshot.items()}
 manifest={
   "schemaVersion":1,
   "origin":"Yangzhou V3 isolated courtyard lab",
   "generation":"Pillow WebP quality 91, method 6, exact RGBA, max dimensions on sprite classes only",
   "status":"preview-only-not-production-asset",
   "assets":rows
 }
 path=OUT/"manifest.json"
 formatted=json.dumps(manifest,indent=2,ensure_ascii=True)+"\n"
 if opts.check:
  if not path.is_file() or path.read_text()!=formatted:
   raise SystemExit("Missing or stale V3 preview manifest")
 else:
  path.write_text(formatted)
 print(f"{len(rows)} artwork preview variants OK; masters unchanged. Original bytes: "+
       f"{sum(v['sourceBytes'] for v in rows.values()):,}; "+
       f"preview bytes: {sum(v['previewBytes'] for v in rows.values()):,}")
if __name__=="__main__":main()
