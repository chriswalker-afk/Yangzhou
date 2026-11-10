#!/usr/bin/env python3
"""Mechanical QA for the 13x4 upright Yangzhou painterly artwork deck.

Passing is NOT equivalent to visual approval: see PAINTERLY-TILE-ART-STANDARD.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'assets' / 'tiles' / 'painterly'
manifest = json.loads((ART / 'manifest.json').read_text())
assert manifest['status'] in ('review','approved'), 'Asset set must be labelled review or approved'
assert len(manifest['archetypes']) == 13, '13 distinct tile archetypes required'
def rotate(code,k):
    return ''.join(code[(i-k)%4] for i in range(4))
faces={'L':[],'S':[],'W':[]}
unique=set()
for i,item in enumerate(manifest['archetypes']):
    assert item['index'] == i
    assert len(item['baseEdges'])==4 and set(item['baseEdges']) <= set('LSW')
    assert len(item['variants'])==4
    path=ART/item['atlas']
    assert path.is_file(), 'Missing atlas: '+str(path)
    assert hashlib.sha256(path.read_bytes()).hexdigest()==item['sha256'], 'SHA256 mismatch '+str(path)
    assert path.stat().st_size == item['bytes'], 'File size mismatch '+str(path)
    with Image.open(path) as whole:
        assert whole.size==(1024,1024), str(path)+' is not a 2x2 512px tile atlas'
        rgb=whole.convert('RGB')
        for k,row in enumerate(item['variants']):
            assert row['rotation']==k
            assert row['edges']==rotate(item['baseEdges'],k)
            assert row['cell']==[k%2,k//2]
            x=(k%2)*512; y=(k//2)*512
            im=np.array(rgb.crop((x,y,x+512,y+512)))
            unique.add(hashlib.sha256(im.tobytes()).hexdigest())
            assert im.var()>500, f'Flat artwork detected at {i}:{k}'
            edges=row['edges']
            for side,code in enumerate(edges):
                if side==0: face=im[0,:,:]
                elif side==1: face=im[:,-1,:]
                elif side==2: face=im[-1,:,:]
                else: face=im[:,0,:]
                faces[code].append(face[8:-8].astype(np.int16))
assert len(unique)>=42,'Tile variants are excessively duplicated'
for typ,arrays in faces.items():
    ref=arrays[0]
    deviations=[int(abs(ref-other).max()) for other in arrays[1:]]
    assert max(deviations,default=0)<=3, f'Canonical {typ} edge pixels do not match: max={max(deviations)}'
    print(f'{typ}: {len(arrays)} matching outer edge signatures (max pixel delta {max(deviations,default=0)})')

lake=ROOT/'assets'/'lake'
tiles=[
    '01-willow-garden.webp','02-northern-lake.webp','03-lakeside-teahouse.webp',
    '04-white-pagoda.webp','05-five-pavilion-bridge.webp','06-breakfast-house.webp']
lakes=[]
for filename in tiles:
    im=Image.open(lake/filename).convert('RGB')
    assert im.size==(512,512), 'Lake master is not a square: '+filename
    lakes.append(np.array(im))
def is_water(c):
    a=c.astype('float32')
    return (a[...,1]>90)&(a[...,2]>85)&(a[...,0]<.9*a[...,1])&(a[...,0]<.94*a[...,2])
for label,line in [('north',lakes[1][0]),('south',lakes[4][-1])]:
    # An exact 88/220 = 205px north/south W mouth centred at x=256.
    outside=np.concatenate([line[:150],line[362:]],axis=0)
    inside=line[166:346]
    assert is_water(inside).mean()>.72, 'Canal '+label+' port blocked'
    assert is_water(outside).mean()<.25, 'Canal '+label+' overlaps external land'
    print('Lake',label,'mouth',round(float(is_water(inside).mean()),2),'land outboard',round(float(is_water(outside).mean()),2))
print('Automated painterly geometry passed: six lake squares, thirteen atlases, fifty-two upright variants.')
print('Still required: real in-game overview/detail screenshot and human art acceptance.')
