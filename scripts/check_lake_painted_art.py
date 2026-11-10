#!/usr/bin/env python3
"""Validate six top-down painted squares before marking them 'approved'.
Requires Pillow. This is strict geometry QA, not a substitute for art review.
Usage: python scripts/check_lake_painted_art.py [asset_dir]
"""
import json
import sys
from pathlib import Path
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
FOLDER=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'assets/lake'
manifest=json.loads((FOLDER/'manifest.json').read_text())
tiles=manifest['tiles']
assert len(tiles)==6, 'Exactly six independently exported tile assets required'
images={}
for t in tiles:
    im=Image.open(FOLDER/t['file']).convert('RGB')
    assert im.width==im.height and im.width>=512, t['file']+' is not a 512px+ square'
    images[(t['x'],t['y'])]=np.array(im)
assert set(images)=={(x,y) for y in range(2) for x in range(3)}
side=next(iter(images.values())).shape[0]
assert all(im.shape==(side,side,3) for im in images.values()), 'Square exports must have identical pixel dimensions'
board=np.concatenate([
    np.concatenate([images[(x,y)] for x in range(3)],axis=1)
    for y in range(2)],axis=0)

def teal(pixels):
    # A robust *screening* classifier, not an artistic segmentation oracle.
    a=pixels.astype('float32')
    return (a[...,1]>90)&(a[...,2]>75)&(a[...,0]<a[...,1]*.87)&(a[...,0]<a[...,2]*.94)

issues=[]
def check_seam(a,b,axis,label):
    difference=np.abs(a.astype('float32')-b.astype('float32'))
    mean=float(difference.mean()); p95=float(np.quantile(difference,.95))
    print('SEAM',label,'mean RGB change',round(mean,1),'95pct',round(p95,1))
    # Adjacent natural image pixels need not be identical but should not jump.
    if mean>32 or p95>88:issues.append(label+' has a hard colour break')
for x in [side,2*side]:
    check_seam(board[:,x-1,:],board[:,x,:],0,'vertical x='+str(x))
check_seam(board[side-1,:,:],board[side,:,:],1,'horizontal y='+str(side))

# Water and street ports must be aligned at the *external perimeter*.
# The natural six-tile lake footprint may be wider at the internal W/W seam:
# the scoreable navigation corridor is not the entire scenic shoreline.
centre=1.5*side
half=44/220*side
port_left=int(round(centre-half));port_right=int(round(centre+half))
for y,label in [(0,'north external'),(2*side-1,'south external')]:
    strip=board[max(0,y-2):min(2*side,y+3)]
    port=float(teal(strip[:,port_left+10:port_right-10]).mean())
    left=float(teal(strip[:,port_left-28:port_left-4]).mean())
    right=float(teal(strip[:,port_right+4:port_right+28]).mean())
    print('PORT',label,'inside',round(port,2),'left outside',round(left,2),'right outside',round(right,2))
    if port<.75:issues.append(label+' water opening is blocked or incorrectly positioned')
    if left>.22 or right>.22:issues.append(label+' lake overruns 88-unit outer tile opening')
# Centre-line water must remain navigable at the internal W/W join,
# but the open lake may legitimately be wider than that 88-unit corridor.
internal=float(teal(board[side-2:side+3,port_left+10:port_right-10]).mean())
print('INTERNAL LAKE',round(internal,2))
if internal<.75:issues.append('Centre lake channel blocked at internal W/W join')
for x,label in [(0,'west outer land'),(3*side-1,'east outer land')]:
    fraction=float(teal(board[:,max(0,x-2):min(3*side,x+3),:]).mean())
    print('OUTER LAND',label,'open water fraction',round(fraction,3))
    if fraction>.07:issues.append(label+' contains a false water exit')
# The Five-Pavilion Bridge must cross both internal east/west street seams
# at world y=330 -> image y=1.5 tile widths.
y=int(round(side*1.5))
def stone(pixels):
    a=pixels.astype('float32')
    return (a[...,0]>130)&(a[...,0]>a[...,1]*1.04)&(a[...,1]>a[...,2]*1.04)
for x,label in [(side,'pagoda-to-bridge'),(side*2,'bridge-to-house')]:
    patch=board[y-10:y+10,x-2:x+3]
    fraction=float(stone(patch).mean())
    print('WALKWAY',label,'stone fraction',round(fraction,2))
    if fraction<.65:issues.append(label+' walking route misses internal street centre')
if issues:
    print('\nNOT APPROVED:')
    for issue in issues:print(' -',issue)
    sys.exit(1)
print('Accepted by automatic seam/port screening; human visual sign-off still required')
