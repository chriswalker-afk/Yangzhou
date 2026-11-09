#!/usr/bin/env python3
"""Build independent, square, unpopulated Yangzhou art masters.

The originals are paintings of *one square tile at a time*. They are never
sliced from a continuous 3x2 starter panorama. World-space roads and canals
are drawn from the shared connector schema at render time, not baked into
an uneditable large scene. This is an interim asset set; new bespoke art for
each topology and local historical review are still required.
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/tiles/sources'
OUT=ROOT/'assets/tiles'
OUT.mkdir(exist_ok=True,parents=True)

road=Image.open(SRC/'road-source.webp').convert('RGB')
bridge=Image.open(SRC/'bridge-source.webp').convert('RGB')
def save(name,image,size=1024):
    image=image.resize((size,size),Image.Resampling.LANCZOS)
    image.save(OUT/name,'WEBP',quality=88,method=6)
    print(name,(OUT/name).stat().st_size)
save('road-straight.webp',road)
save('bridge-stone.webp',bridge)
crops={
 'garden-willow.webp':(road,(0,0,580,580)),
 'garden-courtyard.webp':(road,(685,0,1252,567)),
 'garden-rockery.webp':(bridge,(695,7,1251,563)),
 'garden-blossoms.webp':(bridge,(9,24,548,563)),
 'garden-riverside.webp':(road,(0,680,570,1250)),
 'garden-teahouse.webp':(bridge,(698,662,1250,1214)),
}
for name,(src,rect) in crops.items():
    save(name,src.crop(rect))
stone=road.crop((558,530,798,770))
water=bridge.crop((510,743,750,983))
def mirror_sample(im):
    base=im.resize((256,256),Image.Resampling.LANCZOS)
    out=Image.new('RGB',(512,512))
    out.paste(base,(0,0))
    out.paste(base.transpose(Image.Transpose.FLIP_LEFT_RIGHT),(256,0))
    out.paste(base.transpose(Image.Transpose.FLIP_TOP_BOTTOM),(0,256))
    out.paste(base.transpose(Image.Transpose.ROTATE_180),(256,256))
    return out
save('road-stone-texture.webp',mirror_sample(stone),512)
save('canal-water-texture.webp',mirror_sample(water),512)

# Landmark overlay is a separate nonmoving object, not a panorama. Its
# edges are transparent; it does not control gameplay port positions.
plate=ROOT/'assets/living/starter-clean.webp'
if plate.exists():
    old=Image.open(plate).convert('RGBA')
    x0,y0,x1,y1=(439,200,838,377)
    subject=old.crop((x0,y0,x1,y1))
    mask=Image.new('L',subject.size,0)
    d=ImageDraw.Draw(mask)
    d.polygon([(5,118),(33,88),(47,45),(74,36),(99,51),(114,25),
        (134,21),(154,47),(167,35),(191,8),(220,42),(242,28),
        (261,40),(280,29),(299,49),(329,45),(349,61),
        (364,84),(395,107),(395,141),(373,151),(349,158),
        (301,165),(239,166),(175,159),(111,161),(45,145),(5,138)],fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(3))
    subject.putalpha(mask)
    subject.save(OUT/'five-pavilion-foreground.png',optimize=True)
