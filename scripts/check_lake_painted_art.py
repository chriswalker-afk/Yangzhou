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

# Every N/S water edge is centred at x=1.5 tiles, width 88/220 tile.
centre=1.5*side
half=44/220*side
port_left=int(round(centre-half));port_right=int(round(centre+half))
# Compare bands within 5px of the game tile boundaries (north, middle, south).
for y,label in [(0,'north'),(side,'middle, upper'),(2*side-1,'south')]:
    strip=board[max(0,y-2):min(2*side,y+3)]
    # A gentle median over adjacent pixels avoids interpreting individual ink specks as water.
    port=float(teal(strip[:,port_left+10:port_right-10]).mean())
    left=float(teal(strip[:,port_left-28:port_left-4]).mean())
    right=float(teal(strip[:,port_right+4:port_right+28]).mean())
    print('PORT',label,'inside',round(port,2),'left outside',round(left,2),'right outside',round(right,2))
    if port<.75:issues.append(label+' water opening is blocked or incorrectly positioned')
    if left>.22 or right>.22:issues.append(label+' lake overruns canonical 88-unit opening')
# Water must not cross a land/land tile seam at the E/W edge of the centre column.
# Examine the full source join (especially where the canal broadens).
for x,label in [(side,'west L/L seam'),(side*2,'east L/L seam')]:
    fraction=float(teal(board[:,x-3:x+3,:]).mean())
    print('LAND EDGE',label,'water fraction',round(fraction,3))
    if fraction>.07:issues.append(label+' has too much open water at a no-port edge')
if issues:
    print('\nNOT APPROVED:')
    for issue in issues:print(' -',issue)
    sys.exit(1)
print('Accepted by automatic seam/port screening; human visual sign-off still required')
