#!/usr/bin/env python3
"""Rebuild editable assets for the Living Painting prototype.

Uses our own starter-panorama.webp; no cloud URLs or external source imagery.
Source image is 1200 x 800. Masks are deliberately editable, hand-auditable
coordinates, not a claim of automatic character segmentation.
Run: python scripts/build_living_assets.py
Dependencies: Pillow, NumPy, opencv-python-headless.
"""
from __future__ import annotations
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/painted/starter-panorama.webp"
OUT = ROOT / "assets/living"
OUT.mkdir(parents=True, exist_ok=True)
im = Image.open(SOURCE).convert("RGB")
W, H = im.size
if (W, H) != (1200, 800):
    raise ValueError("Expected 1200 x 800 panorama; adjust masks before rebuilding")

# First extract painting-matched objects. They will NOT remain on the clean plate.
# Crop coordinates, and polygon positions are in full-image coordinates.
ACTORS = {
    "boat-upper": (
        (583, 113, 673, 185),
        [(590, 156), (592, 145), (610, 132), (616, 124), (642, 120),
         (661, 128), (666, 144), (652, 158), (633, 167), (612, 173), (589, 167)]),
    "boat-lower": (
        (570, 566, 722, 707),
        [(577, 619), (584, 599), (623, 582), (657, 593), (677, 620),
         (701, 648), (712, 655), (696, 672), (659, 681), (622, 667),
         (585, 650)]),
    "walker-blue": (
        (257, 298, 301, 373),
        [(277, 320), (270, 329), (270, 344), (264, 353), (269, 359),
         (285, 364), (295, 355), (289, 338), (291, 325), (285, 313)]),
    "walker-rose": (
        (1046, 661, 1119, 754),
        [(1074, 686), (1061, 697), (1064, 718), (1058, 739), (1068, 748),
         (1094, 750), (1100, 731), (1091, 709), (1087, 687)]),
    "walker-ochre": (
        (330, 598, 370, 685),
        [(343, 620), (336, 630), (332, 646), (337, 669), (354, 682),
         (363, 660), (361, 635), (354, 617)]),
}

def rgba_cutout(name: str, bounds, points) -> None:
    x0,y0,x1,y1 = bounds
    src = np.array(im.crop(bounds).convert("RGBA"),copy=True)
    mask = Image.new("L", (x1-x0, y1-y0), 0)
    d = ImageDraw.Draw(mask)
    d.polygon([(x-x0,y-y0) for x,y in points], fill=255)
    # Soft matte edges avoid obvious bright pixel blocks against watercolor.
    mask = mask.filter(ImageFilter.GaussianBlur(1.1))
    src[:,:,3] = np.asarray(mask)
    Image.fromarray(src).save(OUT / f"{name}.png", optimize=True)

for name, (bounds, poly) in ACTORS.items():
    rgba_cutout(name, bounds, poly)

# These areas cover the people embedded in the source panorama.
# Coordinate centres are in source pixels; widths include robes/heads.
PERSONS = [
 # North-west balconies, merchant houses, gardens and food stall
 (42,112,6,12),(89,103,6,12),(102,107,6,12),(124,104,6,12),
 (185,76,7,13),(209,87,7,12),(228,88,7,12),(246,91,6,13),
 (251,129,7,13),(273,126,7,12),(292,128,7,12),
 (302,116,5,11),(335,127,7,15),(346,131,6,12),
 (262,244,8,15),(282,223,8,16),(304,224,8,13),
 (255,268,7,14),(280,272,7,14),(291,286,6,12),
 (226,303,8,13),(240,300,7,12),(276,322,9,19),
 (120,210,7,11),(136,213,8,12),(149,215,8,12),(166,218,8,12),
 (177,215,8,12),(82,213,7,12),(109,214,7,12),
 (73,333,12,18),(110,340,12,19),(138,342,12,20),(168,354,12,22),
 (188,339,10,18),(204,328,8,15),(227,329,7,15),
 (30,334,6,12),(56,350,6,14),(84,355,7,14),
 (349,319,7,13),(386,326,6,13),
 # Distant north canals and the secondary stone bridge
 (527,61,5,10),(536,49,5,9),(547,34,5,10),(559,30,5,10),
 (572,21,5,9),(591,15,5,8),(607,10,5,10),
 (630,14,5,10),(640,20,5,9),(661,26,5,9),(689,34,5,9),
 (719,41,5,9),(729,44,5,8),(741,91,6,12),(754,124,7,14),
 # Bridge approaches, workers at railings, and five pavilions
 (390,300,6,12),(408,302,6,12),(422,306,6,12),(437,309,6,12),
 (457,309,6,11),(476,296,6,11),(490,294,6,11),
 (510,294,6,12),(530,294,6,12),(546,294,6,13),
 (563,294,7,14),(581,291,6,13),(602,282,6,12),
 (615,287,7,14),(631,284,7,13),(650,287,7,13),
 (670,289,7,13),(686,289,7,12),(706,293,6,12),
 (724,303,6,12),(749,304,6,12),(774,302,7,12),
 (796,307,6,13),(818,313,6,13),(838,323,7,13),
 (853,329,7,15),(869,330,8,15),
 # Right shore gardens, walkways, tea stalls and top pavilions
 (770,94,6,13),(797,115,7,14),(817,126,7,14),
 (804,156,7,13),(822,158,7,12),(842,156,6,12),
 (880,148,7,12),(894,157,7,12),(917,154,6,12),
 (1020,158,7,14),(1032,163,7,14),(1057,162,7,13),
 (1084,153,8,12),(1115,156,6,11),
 (1005,206,8,15),(1031,215,9,16),
 (922,187,7,14),(938,201,7,13),(945,215,7,13),
 (902,261,8,16),(914,266,7,13),(934,273,8,16),
 (862,295,6,13),(883,318,8,16),(900,333,8,17),
 (915,356,8,17),(926,382,8,16),
 # Western white pagoda and garden footsteps
 (381,462,7,13),(389,469,8,15),(399,494,7,15),
 (410,503,8,15),(438,487,7,15),
 (286,587,7,14),(305,588,7,15),(318,598,7,15),
 (330,621,10,21),(346,645,10,23),(362,672,10,24),
 (385,693,11,25),(409,705,10,23),
 (274,702,10,21),(247,708,11,22),(217,721,10,22),
 (225,678,10,20),(202,684,10,21),(180,682,10,22),
 (135,683,10,21),(92,682,9,18),(332,775,10,18),
 # Eastern waterside restaurant patrons and workers: empty the tables.
 (814,564,9,22),(884,550,9,20),(912,539,9,17),
 (939,545,10,22),(967,558,9,22),(994,557,9,20),
 (1018,581,10,22),(1045,593,10,22),(1075,606,10,21),
 (1099,585,9,18),(1132,563,10,20),(1164,563,9,18),
 (978,605,10,22),(956,622,10,24),(993,623,10,21),
 (915,602,9,21),(888,594,10,21),(1139,604,9,21),
 # bottom-right lane: visitor and the basket-carrying resident
 (1068,716,15,33),(1094,716,10,25),(1009,764,14,28),
 (983,773,12,21),(1040,777,10,22),
]
mask = np.zeros((H,W),np.uint8)
for x,y,rx,ry in PERSONS:
    cv2.ellipse(mask,(x,y),(rx,ry),0,0,360,255,-1,cv2.LINE_AA)
# Include sprite sources even when an individual centre wasn't listed.
for name,(_rect,poly) in ACTORS.items():
    if name.startswith("boat"):
        cv2.fillPoly(mask,[np.array(poly,np.int32)],255)
    else:
        cv2.fillPoly(mask,[np.array(poly,np.int32)],255)

# The boats occupy broad open water; reconstruct their water from neighbouring
# clean regions instead of letting inpainting smear a 100px-wide hull.
original=np.asarray(im).copy()
base=cv2.cvtColor(original,cv2.COLOR_RGB2BGR)
inpaint=cv2.inpaint(base,mask,5,cv2.INPAINT_TELEA)
rgb=cv2.cvtColor(inpaint,cv2.COLOR_BGR2RGB)

def water_restore(dest_bounds, donor_bounds):
    global rgb
    x0,y0,x1,y1=dest_bounds
    sx0,sy0,sx1,sy1=donor_bounds
    patch=cv2.resize(original[sy0:sy1,sx0:sx1],(x1-x0,y1-y0),interpolation=cv2.INTER_CUBIC)
    # Feather wide areas of river, with textured clean water replacing static boats.
    alpha=np.zeros((y1-y0,x1-x0),np.uint8)
    cv2.ellipse(alpha,((x1-x0)//2,(y1-y0)//2),
        ((x1-x0)//2-5,(y1-y0)//2-5),0,0,360,255,-1)
    alpha=cv2.GaussianBlur(alpha,(0,0),7).astype(np.float32)[:,:,None]/255
    rgb[y0:y1,x0:x1]=np.clip(
        rgb[y0:y1,x0:x1]*(1-alpha)+patch*alpha,0,255).astype(np.uint8)

water_restore((574,110,677,194),(502,102,605,186))
water_restore((565,568,734,716),(506,380,675,528))
# Final pass heals the faint fringes of people and textured river replacement.
rgb=cv2.cvtColor(cv2.inpaint(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),
        cv2.dilate(mask,np.ones((3,3),np.uint8),iterations=1)&(~mask),2,
        cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB)
clean=Image.fromarray(rgb)
clean.save(OUT/"starter-clean.webp","WEBP",quality=93,method=6)

def foreground(name,polygons,blur=1.35):
    m=Image.new("L",(W,H),0);d=ImageDraw.Draw(m)
    for poly in polygons:d.polygon(poly,fill=255)
    m=m.filter(ImageFilter.GaussianBlur(blur))
    out=clean.convert("RGBA");out.putalpha(m)
    # Full-size transparent occlusion plate is anchored exactly to the ground.
    out.save(OUT/f"{name}.png",optimize=True)

# Roof eaves, balustrades and individual stone piers occlude boat traffic.
# Leave arch openings transparent so travellers can pass beneath the bridge.
bridge_roofs=[
 [(440,277),(458,252),(476,240),(488,218),(506,244),(532,264),(529,290),(448,291)],
 [(520,267),(542,235),(561,224),(582,241),(602,262),(599,294),(524,293)],
 [(594,260),(617,225),(636,206),(655,227),(680,257),(676,299),(595,299)],
 [(675,266),(697,234),(716,219),(736,243),(761,269),(754,305),(679,300)],
 [(754,280),(776,249),(795,242),(807,253),(823,294),(816,315),(752,308)]
]
bridge_deck=[
 [(338,322),(376,313),(418,305),(443,292),(481,298),(512,306),
  (549,310),(599,303),(657,305),(696,307),(758,308),
  (806,320),(837,332),(873,346),(874,354),(816,341),
  (760,328),(692,321),(633,321),(571,323),(518,325),
  (457,317),(407,320),(377,329),(339,335)],
 [(500,306),(522,307),(528,356),(512,355)],
 [(580,307),(600,308),(604,348),(587,348)],
 [(684,307),(706,309),(705,352),(687,352)],
 [(784,310),(806,320),(813,351),(796,352)]
]
foreground("bridge-foreground",bridge_roofs+bridge_deck)
foreground("willow-foreground",[
 [(720,398),(744,373),(770,363),(794,385),(825,399),(835,451),
  (813,487),(790,479),(767,456),(736,438)],
 [(877,362),(910,340),(946,348),(973,384),(968,422),(940,433),
  (907,424),(886,405)]
],2.5)

# The source world-to-image transform is fixed; no separate hardcoded tile atlas.
manifest={
 "source":"assets/painted/starter-panorama.webp",
 "source_size":[W,H],"world_size":[660,440],
 "status":"first-pass artist-cleaned plate; masked-and-reconstructed areas need manual art review",
 "people_mask_count":len(PERSONS),
 "files":{
    "background":"assets/living/starter-clean.webp",
    "bridge_foreground":"assets/living/bridge-foreground.png",
    "willow_foreground":"assets/living/willow-foreground.png",
    "boat_large":"assets/living/boat-lower.png",
    "boat_small":"assets/living/boat-upper.png",
    "walkers":["assets/living/walker-blue.png",
               "assets/living/walker-rose.png","assets/living/walker-ochre.png"]
 },
 "layers":["clean plate","water/steam/leaves","moving boats","bridge occlusion",
           "walking residents","willow occlusion","gameplay/UI"],
 "known_limitations":["Artist-assisted removal is a first pass, not fully hand-repainted at pixel level.",
    "Some tiny distant architectural figures may remain pending a detail-by-detail review.",
    "Large boats removed with adjacent water-texture reconstruction rather than scene generation.",
    "Moving boat silhouettes retain their original painted passengers as part of the moving sprite."]
}
(OUT/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
Image.fromarray(mask).save(OUT/"cleanup-mask.png",optimize=True)
print("Built clean plate and",len(ACTORS),"moving sprites;",
      len(PERSONS),"individually marked subjects;",
      round(100*np.count_nonzero(mask)/(W*H),2),"% masked")
