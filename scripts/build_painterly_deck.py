#!/usr/bin/env python3
"""Painterly Yangzhou *review* deck based on the original finished lake artwork.

52 individually composed squares, four compass-upright variants for 13 tile
archetypes, packed for efficient browser loading. Requires human art approval.
"""
from __future__ import annotations
from PIL import Image,ImageDraw,ImageFilter,ImageOps,ImageChops,ImageEnhance
from pathlib import Path
import numpy as np, random, math, json, hashlib, argparse
ROOT=Path(__file__).resolve().parents[1]
STARTER_FILES=['01-willow-garden.webp','02-northern-lake.webp','03-lakeside-teahouse.webp','04-white-pagoda.webp','05-five-pavilion-bridge.webp','06-breakfast-house.webp']
SOURCE=Image.new('RGB',(1536,1024))
for index,filename in enumerate(STARTER_FILES):
    SOURCE.paste(Image.open(ROOT/'assets/lake'/filename).convert('RGB'),((index%3)*512,(index//3)*512))
O=ROOT/'assets/tiles/painterly'
O.mkdir(parents=True, exist_ok=True)
S=512; WORLD=220; WPORT=round(S*88/WORLD); SPORT=round(S*44/WORLD)
DECK=[
('Canal-side teahouse','tea','LWLS'),('Stone-paved street','street','SLSL'),('Willow canal bend','canal','WWLL'),
('Waterfront landing','landing','LWLW'),('Garden enclosure','garden','LLLL'),('Market crossroads','market','SSSS'),
('Canal crossroads','canal','WWWW'),('Street corner','street','SSLL'),('Small stone bridge','bridge','WSWS'),
('Garden pavilion','garden','LSLL'),('Walled courtyard','court','SLLL'),('Canal junction','canal','WWWL'),
('Mooring basin','landing','WLLL')]

def rotate(e,q):return ''.join(e[(i-q)%4] for i in range(4))

def lerp(a,b,t):return a*(1-t)+b*t

# Patches deliberately come from foliage and grass, not roofs, waterways,
# pavilions or painted routes. Avoid mirroring a whole scene into obvious repeats.
LAND_PATCHES=[
 (0,0,280,280),(10,120,270,370),(0,305,260,555),(250,5,510,265),
 (1190,0,1450,260),(1260,70,1520,330),(1250,210,1510,470),
 (20,780,280,1020),(230,850,490,1024),(1265,840,1525,1010),
 (1040,0,1250,215),(0,15,210,225),(1290,390,1530,600)
]
# Only use pixel-weighted mostly-land sections for woodland quilt to avoid rogue
# canals/stone corridors. Source-coordinates are in the 1536x1024 master.
def water_fraction(im):
 a=np.asarray(im).astype('float32');return float(((a[:,:,2]>a[:,:,0]*1.17)&(a[:,:,1]>a[:,:,0]*1.15)&(a[:,:,2]>80)).mean())
GOOD=[]
for x0,y0,x1,y1 in LAND_PATCHES:
 crop=SOURCE.crop((x0,y0,x1,y1))
 if water_fraction(crop) < .23: GOOD.append(crop)
print('clean landscape patches:',len(GOOD))
if len(GOOD)<4:raise RuntimeError('not enough land references')

def make_land(seed):
 # Blend four discrete painterly patches, each with a different identity; preserve
 # high-frequency brushwork within each patch, blur only *inside* the canvas.
 rng=random.Random(seed*307+19)
 locations=[(-42,-42),(S-275,-40),(-36,S-275),(S-274,S-275)]
 bg=Image.new('RGB',(S,S),(135,158,112))
 arr=np.zeros((S,S,3),dtype=np.float32)
 weights=np.zeros((S,S),dtype=np.float32)
 for k,(x,y) in enumerate(locations):
  src=GOOD[(seed*3+k*7+rng.randrange(len(GOOD)))%len(GOOD)]
  # Each window is 330-370 px, overlapping 60-90 px.
  width=rng.randint(320,370)
  crop=src.resize((width,width),Image.Resampling.LANCZOS)
  x+=rng.randint(-10,13); y+=rng.randint(-10,13)
  # A soft ellipse is fine inside the tile but never used on its perimeter.
  yy,xx=np.mgrid[max(0,y):min(S,y+width),max(0,x):min(S,x+width)]
  dx=(xx-x)/width;dy=(yy-y)/width
  wx=np.minimum(1,np.minimum(dx,1-dx)*7)
  wy=np.minimum(1,np.minimum(dy,1-dy)*7)
  w=np.maximum(.03,wx*wy)
  piece=np.asarray(crop)[yy-y,xx-x].astype('float32')
  sl=(slice(max(0,y),min(S,y+width)),slice(max(0,x),min(S,x+width)))
  arr[sl]+=piece*w[:,:,None]; weights[sl]+=w
 mask=weights<.003
 out=arr/np.maximum(weights[:,:,None],1e-3)
 out[mask]=[154,166,120]
 # Use scattered fine pigment, not flat rectangles.
 return Image.fromarray(np.clip(out,0,255).astype(np.uint8),'RGB')

def reflect_texture(box,output_size=256):
 im=SOURCE.crop(box).resize((output_size,output_size),Image.Resampling.LANCZOS)
 # remove obvious seams at repeat boundaries by 4-way reflection.
 return ImageOps.mirror(im)

STONE=SOURCE.crop((362,747,472,817)).resize((256,256),Image.Resampling.LANCZOS)
# Another fragment with real granite cobbles near the western footbridge.
WATER=SOURCE.crop((645,210,905,470)).resize((256,256),Image.Resampling.LANCZOS)

def textured_canvas(texture,seed):
 # Offset varies, pattern always high-res original photographed/painted material.
 a=Image.new('RGB',(S,S))
 rng=random.Random(seed*171+3)
 for y in range(-256,S+256,256):
  for x in range(-256,S+256,256):
   patch=texture
   if rng.randrange(2):patch=ImageOps.mirror(patch)
   a.paste(patch,(x,y))
 return a

def points_for(types,typ):
 ids=[i for i,c in enumerate(types) if c==typ]
 C=(S/2,S/2); P=[(S/2,0),(S,S/2),(S/2,S),(0,S/2)]
 def bezier(a,b,seed=0):
  tangents={0:(0,1),1:(-1,0),2:(0,-1),3:(1,0)}
  if b is None:
   # one-ended road stops at anchored site near the middle.
   tx,ty=C
  else:tx,ty=P[b]
  sx,sy=P[a]
  if b is not None and ((a+2)%4)==b:
   # subtly winding with zero offset and tangent at both ports.
   return [(int(round(lerp(sx,tx,t)+12*math.sin(math.pi*t)**2*(1 if a%2==0 else 0))),
            int(round(lerp(sy,ty,t)+12*math.sin(math.pi*t)**2*(1 if a%2==1 else 0)))) for t in np.linspace(0,1,105)]
  dx,dy=tangents[a];r=105
  B=(sx+dx*r,sy+dy*r)
  if b is not None:
   ex,ey=tangents[b];D=(tx+ex*r,ty+ey*r)
  else:D=(tx,ty)
  return [(int(round((1-t)**3*sx+3*(1-t)**2*t*B[0]+3*(1-t)*t*t*D[0]+t**3*tx)),
           int(round((1-t)**3*sy+3*(1-t)**2*t*B[1]+3*(1-t)*t*t*D[1]+t**3*ty))) for t in np.linspace(0,1,75)]
 if len(ids)==2:return [bezier(ids[0],ids[1])]
 return [bezier(i,None) for i in ids]

def line_mask(paths,width,blur=0):
 m=Image.new('L',(S,S),0);d=ImageDraw.Draw(m)
 for points in paths:
  if len(points)<2:continue
  d.line(points,fill=255,width=width,joint='curve')
  rr=width//2
  for x,y in [points[-1]]:
   d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=255)
 if blur:return m.filter(ImageFilter.GaussianBlur(blur))
 return m

def draw_network(im,sig,seed):
 # Fine bank and shore detail; road/water mouth exact at the edge.
 for typ,width in [('W',WPORT),('S',SPORT)]:
  if typ not in sig:continue
  lines=points_for(sig,typ)
  for spread,rgb in ([(width+18,(95,106,78)),(width+9,(194,188,146)),(width+1,None)] if typ=='W' else
                     [(width+14,(114,103,76)),(width+7,(218,199,161)),(width+1,None)]):
   mask=line_mask(lines,spread,1 if spread!=width+1 else 0)
   if rgb:
    lay=Image.new('RGB',(S,S),rgb);im.paste(lay,(0,0),mask)
   else:
    material=textured_canvas(WATER if typ=='W' else STONE,seed)
    # Shift brightness/colour to support golden stone and shallow teal.
    if typ=='S':material=ImageEnhance.Color(material).enhance(.62)
    im.paste(material,(0,0),mask)
  # add finely drawn pathway expansion joints - not broad vector stroke.
  if typ=='S':
   over=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(over)
   for line in lines:
    for j in range(8,len(line)-8,8):
     cx,cy=line[j];p=line[min(j+1,len(line)-1)];p0=line[max(0,j-1)]
     dx=p[0]-p0[0];dy=p[1]-p0[1];ln=math.hypot(dx,dy) or 1
     nx=-dy/ln;ny=dx/ln;half=width*.46
     d.line([(cx+nx*half,cy+ny*half),(cx-nx*half,cy-ny*half)],fill=(128,103,73,72),width=1)
   # only inside walkway, to avoid drawing detached line segments.
   over.putalpha(ImageChops.multiply(over.getchannel('A'),line_mask(lines,width-6)))
   im=Image.alpha_composite(im.convert('RGBA'),over).convert('RGB')
 return im

def canon_edges(im,sig,depth=8):
 # Only a <2% narrow seam adjustment (old art used >60 px collars).
 # Consistent pixel-exact edge colour per L/S/W port and orientation.
 a=np.array(im,np.uint8).astype(np.float32)
 mid=(S-1)/2
 u=np.arange(S,dtype=np.float32)
 noise=1.8*np.sin(u*.13)+1.1*np.sin(u*.53)
 base=np.stack([150+noise,168+noise*.72,122+noise*.54],axis=-1)
 for i,ch in enumerate(sig):
  color=base.copy()
  if ch in 'SW':
   w=SPORT if ch=='S' else WPORT
   selection=np.abs(u-mid)<w/2
   target=np.array([207,190,154] if ch=='S' else [113,165,161],dtype=np.float32)
   color[selection]=target+noise[selection,None]*.65
   near=np.abs(np.abs(u-mid)-w/2)<2.5
   color[near]=[111,108,83] if ch=='S' else [212,204,161]
  for k in range(depth):
   alpha=.2*(1-k/depth) if k>0 else 1
   if i==0:idx=(k,slice(None))
   elif i==1:idx=(slice(None),S-1-k)
   elif i==2:idx=(S-1-k,slice(None))
   else:idx=(slice(None),k)
   a[idx]=a[idx]*(1-alpha)+color*alpha
 return Image.fromarray(a.clip(0,255).astype('uint8'),'RGB')

# Original master landmark crops: all remain compass-upright. Interpolate into
# the ground away from all external ports and route centre-lines.
MOTIFS={
 'willow':(185,0,470,250),
 'blossom':(90,220,365,485),
 'rockery':(18,250,180,515),
 'tea':(1090,58,1458,322),
 'courtyard':(1172,535,1526,958),
 'pagoda':(48,676,295,925),
 'lotus':(544,145,835,333),
 'bridge':(425,614,1130,836),
}

def add_motif(base,kind,sig,seed):
  rs=random.Random(seed*539+8)
  # Decide an appropriate hand-painted subject; target a safe pocket clear of
  # external mouths and central roads/canals.
  choice={
   'tea':['tea','willow'], 'street':['blossom','willow'], 'canal':['willow','rockery'],
   'landing':['tea','lotus'],'garden':['blossom','willow','rockery'],
   'market':['tea','courtyard'],'bridge':['bridge'], 'court':['courtyard']
  }.get(kind,['willow','blossom'])
  motif=choice[seed%len(choice)]
  if kind=='bridge' and set(sig)=={'W','S'}:
   # For true crossing bridge, use full historical five-roof master instead of
   # geometric road overlay. This crop is an in-canvas architecture layer.
   crop=SOURCE.crop(MOTIFS['bridge']).resize((490,164),Image.Resampling.LANCZOS)
   soft=Image.new('L',crop.size,0)
   ImageDraw.Draw(soft).rounded_rectangle((7,8,crop.width-8,crop.height-8),radius=38,fill=255)
   soft=soft.filter(ImageFilter.GaussianBlur(15));base.paste(crop,(11,174),soft)
   return base
  x0,y0,x1,y1=MOTIFS[motif]
  crop=SOURCE.crop((x0,y0,x1,y1))
  width={ 'tea':200,'courtyard':220,'pagoda':180,'blossom':165,'willow':205,'rockery':160,'lotus':140 }.get(motif,175)
  if kind in ('street','canal'):width=int(width*.75)
  height=int(crop.height*width/max(1,crop.width))
  crop=crop.resize((width,height),Image.Resampling.LANCZOS)
  pts=[]
  for y in (100,340):
   for x in (100,345):
    # Avoid landing architecture across a declared port near a tile edge.
    rr=math.hypot(x-256,y-256)
    pts.append((x,y,rr+rs.random()*30))
  spots=sorted(pts,key=lambda x:-x[2])
  # If the north or west edge is a road, prefer buildings near opposite side.
  which=(seed//3)%4
  x,y,_=spots[which]
  x=int(min(S-width-20,max(18,x-width//2)))
  y=int(min(S-height-18,max(18,y-height//2)))
  # Landmark cutouts are soft *inside* the tile only; no tile seam blur.
  mask=Image.new('L',(width,height),0)
  ImageDraw.Draw(mask).ellipse((6,4,width-6,height-4),fill=255)
  mask=mask.filter(ImageFilter.GaussianBlur(17))
  base.paste(crop,(x,y),mask)
  return base

def smooth_noise(seed,scale=20):
  rng=np.random.default_rng(seed)
  low=(rng.random((scale,scale))*2-1).astype('float32')
  import cv2
  return cv2.resize(low,(S,S),interpolation=cv2.INTER_CUBIC)

def organic_mask(lines,half,seed,material='water'):
  # Rasterise a variable-width handpainted shape with coherent perturbation
  # of its banks. Mouths remain exactly aligned with the geometric edge port.
  import cv2
  bitmap=np.zeros((S,S),np.uint8)
  for line in lines:
    for j,(x,y) in enumerate(line):
      t=j/max(1,len(line)-1)
      # Roads become narrower, natural garden paths away from gateways.
      if material=='road':
        r=half*.34+half*.66*(math.exp(-t*23)+math.exp(-(1-t)*23))
      else:
        r=half*(1+.12*math.sin(math.pi*t)**2)
      cv2.circle(bitmap,(int(x),int(y)),int(round(r)),255,-1,cv2.LINE_AA)
  inside=cv2.distanceTransform(bitmap,cv2.DIST_L2,3)
  outside=cv2.distanceTransform(255-bitmap,cv2.DIST_L2,3)
  signed=inside-outside
  noise=smooth_noise(seed,25)*((2 if material=='road' else 5))
  # At all outer edges (first 5px), no jaggedness: exact width is critical.
  taper=np.ones((S,S),dtype=np.float32)
  for d in range(8):
    alpha=min(1,d/8)
    taper[d,:]*=alpha;taper[-1-d,:]*=alpha
    taper[:,d]*=alpha;taper[:,-1-d]*=alpha
  margin=signed+noise*taper
  mask=(np.clip(margin+1.3,0,2.6)/2.6*255).astype('uint8')
  return Image.fromarray(mask,'L')

def water_surface(seed):
  # Use finished painterly lake, not a tiled noise block. Shift within the full
  # independently painted source square; no repeating rectangular patches.
  im=Image.open(ROOT/'assets/lake/02-northern-lake.webp').convert('RGB')
  return im if seed%2==0 else ImageOps.mirror(im)

def stone_surface(seed):
  # Hand-drawn irregular paving: replace the previous repeated rectangular
  # copied stone strip (which failed art review).
  rng=random.Random(seed*241+29)
  out=Image.new('RGB',(S,S),(216,197,158));d=ImageDraw.Draw(out)
  for row,y in enumerate(range(-40,S+40,24)):
    x=-35-(row%2)*14
    while x<S+30:
      w=rng.randint(24,40);h=rng.randint(19,29)
      dx=rng.randint(-3,3);dy=rng.randint(-2,2)
      c=rng.choice([(219,203,171),(214,198,168),(225,207,176),(204,187,159),(217,200,169)])
      poly=[(x+dx+3,y+dy),(x+w-2,y+dy+1),(x+w+2,y+h-2),(x+2,y+h+1)]
      d.polygon(poly,fill=c,outline=(182,165,134),width=1)
      x+=w+rng.randint(1,4)
  # Ingrained watercolor wash and ink variation sampled from the master.
  arr=np.array(out).astype('float32')
  noise=smooth_noise(seed*19+101,90)*6
  arr+=noise[:,:,None]
  return Image.fromarray(arr.clip(0,255).astype('uint8'),'RGB')

def draw_network(im,sig,seed):
  arr=im.copy()
  for typ in ('W','S'):
    if typ not in sig:continue
    lines=points_for(sig,typ)
    half=(WPORT if typ=='W' else SPORT)/2
    outer=organic_mask(lines,half+(7 if typ=='W' else 4),seed+39,'water' if typ=='W' else 'road')
    inner=organic_mask(lines,half,seed+39,'water' if typ=='W' else 'road')
    bank=Image.new('RGB',(S,S),(177,171,139) if typ=='W' else (190,175,144))
    arr.paste(bank,(0,0),outer)
    # The bank is narrow and visibly defined, not a wide hazy collar.
    material=water_surface(seed) if typ=='W' else stone_surface(seed)
    arr.paste(material,(0,0),inner)
    if typ=='W':
      # Scatter natural rockery and a few lotus pads along the shore where
      # there is planting space; do not obscure the nav centreline.
      d=ImageDraw.Draw(arr,'RGB')
      rng=random.Random(seed*11)
      a=np.array(outer);b=np.array(inner)
      candidates=np.argwhere((a>230)&(b<100))
      if len(candidates):
        for _ in range(105):
          y,x=map(int,candidates[rng.randrange(len(candidates))]);r=rng.randint(1,4)
          d.ellipse((x-r,y-r//2,x+r,y+r//2),fill=rng.choice([(175,173,148),(207,199,171),(133,145,120),(199,185,157)]))
  return arr

def make_tile(index,rotation):
 name,kind,edges=DECK[index]
 sig=rotate(edges,rotation)
 seed=109+index*23+rotation*71
 # Each square starts with an *entire* real painting, no quadrant collage.
 # The architectural subjects remain upright when the road ports rotate.
 bgs={
    'tea':['01-willow-garden.webp','01-willow-garden.webp'],
    'street':['01-willow-garden.webp','03-lakeside-teahouse.webp'],
    'canal':['01-willow-garden.webp','03-lakeside-teahouse.webp'],
    'landing':['03-lakeside-teahouse.webp','06-breakfast-house.webp'],
    'garden':['01-willow-garden.webp','03-lakeside-teahouse.webp'],
    'market':['01-willow-garden.webp','01-willow-garden.webp'],
    'bridge':['05-five-pavilion-bridge.webp'],
    'court':['06-breakfast-house.webp'],
 }
 if kind=='bridge':
    source=Image.open(ROOT/'assets/lake/05-five-pavilion-bridge.webp').convert('RGB')
    # The bridge itself physically rotates with its route; roofs remain drawn
    # from above (no side elevation appears), unlike rotating a flat icon.
    bg=source.rotate(-90*rotation,expand=False)
 elif kind=='canal' and sig in ('WLWL','LWLW'):
    source=Image.open(ROOT/'assets/lake/02-northern-lake.webp').convert('RGB')
    bg=source if sig=='WLWL' else source.rotate(-90,expand=False)
 else:
    choices=bgs[kind]
    source=Image.open(ROOT/'assets/lake'/choices[(rotation+index)%len(choices)]).convert('RGB')
    # No quarter-turn of gardens or roofs. A mild mirror is acceptable for
    # natural foliage but never for a recognisable architectural monument.
    if kind in ('street','canal','garden') and (rotation%2):source=ImageOps.mirror(source)
    if kind=='garden' and sig=='LLLL' and rotation>=2:
        # Garden tiles rotate their route logic, not their botanical composition.
        # Preserve upright vegetation without identical repeated crops.
        enlarged=source.resize((555,555),Image.Resampling.LANCZOS)
        shift=10 if rotation==2 else 32
        source=enlarged.crop((shift,43-shift,shift+512,43-shift+512))
    bg=source
    bg=draw_network(bg,sig,seed)
    if kind=='garden' and sig=='LSLL':
        bg=add_motif(bg,'garden',sig,seed)
    if kind=='landing' and 'W' in sig and len(set(sig))==2:
        bg=add_motif(bg,'landing',sig,seed)
 bg=canon_edges(bg,sig,depth=4)
 return bg,sig

manifest={'version':'painterly-deck-review-v2','status':'review','displayByDefault':True,'tile_px':512,'world_units':220,
          'visualStandard':'docs/PAINTERLY-TILE-ART-STANDARD.md','source':'coordinated Slender West Lake painterly master; recomposed with deterministic ink-texture paths; human art signoff required',
          'archetypes':[]}
contact=Image.new('RGB',(4*S,13*S),(222,211,188))
for index,(name,kind,edges) in enumerate(DECK):
 atlas=Image.new('RGB',(2*S,2*S),(0,0,0))
 meta={'index':index,'name':name,'kind':kind,'baseEdges':edges,'atlas':f'archetype-{index:02d}.webp','variants':[]}
 for rotation in range(4):
  tile,sig=make_tile(index,rotation)
  atlas.paste(tile,((rotation%2)*S,(rotation//2)*S))
  contact.paste(tile,(rotation*S,index*S))
  meta['variants'].append({'rotation':rotation,'edges':sig,'cell':[rotation%2,rotation//2]})
 path=O/meta['atlas'];atlas.save(path,'WEBP',lossless=True,method=5)
 meta['bytes']=path.stat().st_size;meta['sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
 manifest['archetypes'].append(meta)
 print(index, name, meta['bytes'])
(O/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
contact.resize((4*232,13*232),Image.Resampling.LANCZOS).save(O/'tile-deck-contact.jpg',quality=90)
# ring preview uses sample tiles without hiding their details
from PIL import ImageFont
preview=Image.new('RGB',(4*256,4*256),(224,216,198))
ids=[(4,0),(4,1),(4,2),(2,0),(-1,0),(0,0),(3,0),(1,0), (8,0),(12,0),(10,0),(5,0),(11,0),(9,0),(7,0),(6,0)]
for k,(idx,rot) in enumerate(ids):
 if idx<0:
  img=Image.open(ROOT/'assets/lake/05-five-pavilion-bridge.webp')
 else:img=make_tile(idx,rot)[0]
 preview.paste(img.resize((256,256),Image.Resampling.LANCZOS),((k%4)*256,(k//4)*256))
preview.save(O/'mixed-tile-gallery.jpg',quality=92)
print('WROTE',str(O))