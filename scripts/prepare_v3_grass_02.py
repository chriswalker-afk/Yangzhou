#!/usr/bin/env python3
"""Prepare the approved fine-scale Yangzhou V3 grass as a seamless derivative.
Original PNG input is never modified. The interior of the artwork is preserved;
only 72px along each opposing boundary are gently blended. Output WebP is
lossless from the prepared pixels, not pixel-identical to the untouched PNG.
Requires Pillow and numpy. Never changes road/canal mask or 440-world repeat.
"""
from pathlib import Path
from hashlib import sha256
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets/v3/materials/sources/grass-02-original.png'
OUT=ROOT/'assets/v3/materials/grass-02-lossless.webp'
SOURCE_SHA='8b4792d4982b865d85075ade31f451edb085768ac6dfccabff0fc8efaf9badc4'
assert sha256(SRC.read_bytes()).hexdigest()==SOURCE_SHA, 'Grass v2 source changed'
im=Image.open(SRC).convert('RGB')
assert im.size==(1254,1254)
arr=np.asarray(im,dtype=np.float32).copy()
H,W=arr.shape[:2]
fade=72
for axis in (1,0):
 n=W if axis==1 else H
 for i in range(fade):
  weight=0.5*(1+np.cos(np.pi*i/(fade-1)))
  if axis==1:
   aa=arr[:,i,:].copy();bb=arr[:,n-1-i,:].copy()
   mid=(aa+bb)/2
   arr[:,i,:]=aa+(mid-aa)*weight
   arr[:,n-1-i,:]=bb+(mid-bb)*weight
  else:
   aa=arr[i,:,:].copy();bb=arr[n-1-i,:,:].copy()
   mid=(aa+bb)/2
   arr[i,:,:]=aa+(mid-aa)*weight
   arr[n-1-i,:,:]=bb+(mid-bb)*weight
pix=np.clip(np.rint(arr),0,255).astype('uint8')
assert np.array_equal(pix[:,0,:],pix[:,-1,:])
assert np.array_equal(pix[0,:,:],pix[-1,:,:])
Image.fromarray(pix,'RGB').save(OUT,'WEBP',lossless=True,method=6,exact=True)
assert np.array_equal(np.asarray(Image.open(OUT).convert('RGB')),pix), 'Lossless mismatch'
print(OUT,OUT.stat().st_size,sha256(OUT.read_bytes()).hexdigest())
