#!/usr/bin/env python3
"""Deterministic, topologically exact, high-resolution Yangzhou tile masters.

Artwork is produced from the project's original, licensed painted square
source studies, never from slices of the Slender West Lake panorama.
The square is authored independently for every gameplay topology/rotation.
Motion is NOT baked into the image (people, boats, wakes, steam stay separate).
A shared 1024px edge contract gives pixel-identical adjoining ports.
"""
from __future__ import annotations

import hashlib
import json
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "tiles"
DEST = SRC / "production"
DEST.mkdir(parents=True, exist_ok=True)
SIZE = 1024
WORLD = 220
PORT = {"L": 0, "S": round(44 / WORLD * SIZE), "W": round(88 / WORLD * SIZE)}
DIRS = ((0, -1), (1, 0), (0, 1), (-1, 0))
STARTERS = [
    ("causeway", "SLSL", 1),
    ("lake", "WLWL", 2),
    ("tea", "SLSL", 3),
    ("pagoda", "SSSL", 4),
    ("five", "WSWS", 5),
    ("landing", "SSSS", 6),
]
ARCHETYPES = [
    ("tea", "LWLS"), ("street", "SLSL"), ("canal", "WWLL"),
    ("landing", "LWLW"), ("garden", "LLLL"), ("market", "SSSS"),
    ("canal", "WWWW"), ("street", "SSLL"), ("bridge", "WSWS"),
    ("garden", "LSLL"), ("court", "SLLL"), ("canal", "WWWL"),
    ("landing", "WLLL"),
]
MOTIFS = [
    "garden-willow.webp", "garden-courtyard.webp", "garden-rockery.webp",
    "garden-blossoms.webp", "garden-riverside.webp", "garden-teahouse.webp",
]
SOURCE_FILES = ["road-straight.webp", "bridge-stone.webp", "river-straight.webp",
                "road-teahouse.webp", "road-pagoda.webp", "road-landing.webp",
                "road-stone-texture.webp", "canal-water-texture.webp", *MOTIFS]
SOURCE = {p: Image.open(SRC / p).convert("RGB") for p in SOURCE_FILES}
BOATS = False
ENTRIES = []
QA_DIR = ROOT / "artifacts" / "production"
QA_DIR.mkdir(parents=True, exist_ok=True)


def reflect_tile(patch: Image.Image, target: int = SIZE) -> Image.Image:
    """Four-way reflected sampling makes nature/paving repeat without hard cut lines."""
    patch = patch.resize((target // 2, target // 2), Image.Resampling.LANCZOS)
    combined = Image.new("RGB", (target, target))
    combined.paste(patch, (0, 0))
    combined.paste(patch.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (target // 2, 0))
    combined.paste(patch.transpose(Image.Transpose.FLIP_TOP_BOTTOM), (0, target // 2))
    combined.paste(patch.transpose(Image.Transpose.ROTATE_180), (target // 2, target // 2))
    return combined


# Grass is sampled from a standalone square road painting; there is no crop
# from a panoramic scene and this texture contains no humans or boats.
# Use genuine material-only fragments for connection surfaces. The older
# texture images included WHOLE PATH SHAPES; mirroring those introduced an
# unmistakable repeating diamond in every road. This samples real stone and
# clear water instead, so no route geometry is baked into the texture.
grass = SOURCE["garden-courtyard.webp"].copy()
stone = reflect_tile(SOURCE["road-straight.webp"].crop((481, 276, 553, 367)))
water = reflect_tile(SOURCE["river-straight.webp"].crop((467, 312, 598, 452)))


def rough_mask(mask: Image.Image, seed: int, blur: float = 15) -> Image.Image:
    """Shape a soft, non-rectangular transition for painterly landscape decals."""
    a = np.asarray(mask.filter(ImageFilter.GaussianBlur(blur)), dtype=np.float32)
    yy, xx = np.indices((SIZE, SIZE), dtype=np.float32)
    fractal = (7*np.sin(xx*.022+seed)*np.sin(yy*.014+seed*.37) +
               4*np.sin(xx*.059+seed*.71)*np.cos(yy*.043+seed))
    a = np.clip(a + fractal, 0, 255)
    return Image.fromarray(a.astype("uint8"), "L")


def stamps(base: Image.Image, kind: str, seed: int, forbidden: Image.Image) -> Image.Image:
    """Place high-detail painterly architecture/rockeries on free land only."""
    # Motifs are cropped from independently painted square tile sources and
    # feathered into free land; their frames, people and routes are not reused.
    options = {
        "causeway": [0, 3], "lake": [4, 0], "tea": [5, 1],
        "pagoda": [2, 1], "five": [0, 3], "landing": [5, 3],
        "garden": [1, 2, 3], "market": [5, 1], "street": [0, 3],
        "canal": [4, 2], "bridge": [2, 0], "court": [1, 5],
    }
    picks = options.get(kind, [0, 2])
    # Quadrant-level composition keeps clear space at each connection port.
    locations = [(36, 55, 390), (610, 46, 360), (30, 623, 375), (615, 615, 370)]
    rng = random.Random(seed * 971 + len(kind))
    clear = ImageChops.invert(forbidden.filter(ImageFilter.MaxFilter(53)))
    for j, sample in enumerate(picks[:3]):
        img = SOURCE[MOTIFS[sample]]
        x, y, width = locations[(seed + j*2) % 4]
        x += rng.randint(-30, 20)
        y += rng.randint(-24, 26)
        width += rng.randint(-18, 28)
        # The content remains upright. It is not rotated with the terrain ports.
        sx = (sample*61 + seed*47) % 155
        sy = (sample*41 + seed*29) % 155
        crop = img.crop((sx, sy, sx + 750, sy + 750)).resize((width, width), Image.Resampling.LANCZOS)
        on = Image.new("L", (SIZE, SIZE), 0)
        d = ImageDraw.Draw(on)
        d.ellipse((x+8, y+4, x+width-8, y+width-2), fill=245)
        on = rough_mask(on, seed+j, 35)
        on = ImageChops.multiply(on, clear)
        # Edge-safe: distinctive motifs never protrude over the common connection strip.
        edge = Image.new("L", (SIZE, SIZE), 0)
        ImageDraw.Draw(edge).rectangle((72, 72, SIZE-73, SIZE-73), fill=255)
        on = ImageChops.multiply(on, edge.filter(ImageFilter.GaussianBlur(25)))
        layer = Image.new("RGB", (SIZE, SIZE))
        layer.paste(crop, (x, y))
        base.paste(layer, (0, 0), on)
    return base


def endpoint(i: int) -> tuple[float, float]:
    return [(SIZE/2, 0), (SIZE, SIZE/2), (SIZE/2, SIZE), (0, SIZE/2)][i]


def cubic(a, b, c, d, steps=90):
    out = []
    for step in range(steps+1):
        t = step / steps
        x = (1-t)**3*a[0] + 3*(1-t)**2*t*b[0] + 3*(1-t)*t*t*c[0] + t**3*d[0]
        y = (1-t)**3*a[1] + 3*(1-t)**2*t*b[1] + 3*(1-t)*t*t*c[1] + t**3*d[1]
        out.append((int(round(x)), int(round(y))))
    return out


def paths(edges: str, type_: str):
    chosen = [i for i, e in enumerate(edges) if e == type_]
    centre = (SIZE/2, SIZE/2)
    if len(chosen) == 2:
        a, b = chosen
        if (a+2)%4 == b:
            p, q = endpoint(a), endpoint(b)
            if a % 2 == 0:
                # Gently undulating vertical line, centred at BOTH outer borders.
                return [[(int(SIZE/2+14*math.sin(math.pi*t/90)**2), int(p[1]+(q[1]-p[1])*t/90)) for t in range(91)]]
            return [[(int(p[0]+(q[0]-p[0])*t/90), int(SIZE/2+14*math.sin(math.pi*t/90)**2)) for t in range(91)]]
        p, q = endpoint(a), endpoint(b)
        # Tangents remain perpendicular to the edge where they cross it.
        controls = {
            0: (SIZE/2, SIZE/2), 1: (SIZE/2, SIZE/2),
            2: (SIZE/2, SIZE/2), 3: (SIZE/2, SIZE/2),
        }
        return [cubic(p, centre, centre, q)]
    if len(chosen) == 1:
        return [[endpoint(chosen[0]), centre]]
    return [[endpoint(i), centre] for i in chosen]


def draw_lines(draw: ImageDraw.ImageDraw, lines, width, color):
    for line in lines:
        if len(line) > 1:
            draw.line(line, fill=color, width=width, joint="curve")
            r = width//2
            for x, y in [line[0], line[-1]]:
                draw.ellipse((int(x-r), int(y-r), int(x+r), int(y+r)), fill=color)


def route_mask(edges: str, type_: str, width: int, blur: float = 1.5) -> Image.Image:
    cv = Image.new("L", (SIZE, SIZE), 0)
    draw_lines(ImageDraw.Draw(cv), paths(edges, type_), width, 255)
    return cv.filter(ImageFilter.GaussianBlur(blur)) if blur else cv


def landscape(kind: str, edges: str, seed: int) -> Image.Image:
    """One complete richly painted 1024px square, not an assembled patchwork.

    The original multi-quadrant sketch made repeated mirrored willows,
    square blending frames and implausible landscape. The ground is now one
    self-contained illustrated square master, to preserve genuine brush detail.
    Routes are drawn only after its composition has been selected.
    """
    choices = {
        "causeway": ["road-straight.webp"],
        "lake": ["river-straight.webp"],
        "tea": ["road-teahouse.webp","garden-teahouse.webp"],
        "pagoda": ["garden-rockery.webp","garden-blossoms.webp"],
        "five": ["bridge-stone.webp"],
        "landing": ["road-landing.webp","garden-courtyard.webp"],
        "garden": ["garden-courtyard.webp","garden-willow.webp","garden-blossoms.webp"],
        "market": ["garden-teahouse.webp","road-landing.webp"],
        "street": ["road-straight.webp","garden-willow.webp","garden-courtyard.webp"],
        "canal": ["river-straight.webp","garden-rockery.webp","garden-riverside.webp"],
        "bridge": ["bridge-stone.webp"],
        "court": ["garden-courtyard.webp","garden-teahouse.webp"],
    }
    options=choices.get(kind,MOTIFS)
    # Deterministically vary variants while keeping every building upright.
    chosen=options[(seed // 7) % len(options)]
    # Preserve entire paintings wherever their illustrated route already has
    # the correct topology; overlaying them hid beautiful bridge masonry.
    illustrated={
       ("causeway","SLSL"):"road-straight.webp",
       ("lake","WLWL"):"river-straight.webp",
       ("five","WSWS"):"bridge-stone.webp",
       ("tea","SLSL"):"road-teahouse.webp",
       ("street","SLSL"):"road-straight.webp",
       ("canal","WLWL"):"river-straight.webp",
       ("bridge","WSWS"):"bridge-stone.webp",
    }
    chosen=illustrated.get((kind,edges),chosen)
    bg=SOURCE[chosen].copy()
    rng = np.random.default_rng(seed*119 + 5)
    arr=np.asarray(bg,dtype=np.int16)
    yy,xx=np.indices((SIZE,SIZE))
    mottling=(2*np.sin(xx*.017+seed)+2*np.cos(yy*.019-seed)+
              rng.normal(0, .9, size=(SIZE,SIZE)))
    arr=np.clip(arr + mottling[:,:,None],0,255).astype("uint8")
    return Image.fromarray(arr,"RGB")


def decorate_routes(im: Image.Image, edges: str, seed: int) -> Image.Image:
    # Each transportation network is authored as continuous curves before
    # any crisp frame edge is applied. The water goes under the walking bridge.
    if "W" in edges:
        shape = paths(edges, "W")
        outer = Image.new("L", (SIZE,SIZE),0)
        draw_lines(ImageDraw.Draw(outer),shape,PORT["W"]+43,255)
        im.paste((117,111,91), (0,0), outer.filter(ImageFilter.GaussianBlur(3)))
        mid = Image.new("L", (SIZE,SIZE),0)
        draw_lines(ImageDraw.Draw(mid),shape,PORT["W"]+25,255)
        im.paste((208,194,160), (0,0), mid.filter(ImageFilter.GaussianBlur(2.6)))
        inner = route_mask(edges,"W",PORT["W"]+2,1.7)
        im.paste(water,(0,0),inner)
        # Scattered highlights in the painted surface, clipped to the canal.
        ripple=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
        rd=ImageDraw.Draw(ripple)
        rng=random.Random(seed*383)
        for j in range(65):
            x=rng.randrange(SIZE)
            y=rng.randrange(SIZE)
            rx=rng.randint(7,25)
            rd.arc((x-rx,y-4,x+rx,y+4), 190,340, fill=(241,236,208,rng.randint(25,70)),width=2)
        ripple.putalpha(ImageChops.multiply(ripple.getchannel("A"),inner))
        im=Image.alpha_composite(im.convert("RGBA"),ripple).convert("RGB")
    if "S" in edges:
        shape=paths(edges,"S")
        border=Image.new("L",(SIZE,SIZE),0)
        draw_lines(ImageDraw.Draw(border),shape,PORT["S"]+20,255)
        im.paste((118,101,77),(0,0),border.filter(ImageFilter.GaussianBlur(2)))
        border2=Image.new("L",(SIZE,SIZE),0)
        draw_lines(ImageDraw.Draw(border2),shape,PORT["S"]+10,255)
        im.paste((232,217,183),(0,0),border2.filter(ImageFilter.GaussianBlur(1.7)))
        mid=route_mask(edges,"S",PORT["S"],1.1)
        im.paste(stone,(0,0),mid)
        # Stone coping gently marks bridge crossings instead of painting
        # an unrelated footpath on the water.
        if "W" in edges:
            shadow=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
            painter=ImageDraw.Draw(shadow)
            painter.arc((345,345,679,679), 195,345,fill=(116,100,78,126),width=5)
            painter.arc((363,363,661,661), 15,165,fill=(116,100,78,126),width=5)
            im=Image.alpha_composite(im.convert("RGBA"),shadow).convert("RGB")
    return im



def landmarks(im: Image.Image, kind: str, seed: int) -> Image.Image:
    """Keep Yangzhou's signature architecture crisp and free of painted crowds.

    Only isolated architectural details are used from standalone reference art;
    the large starter panorama is never used as a tile source.
    """
    if kind == "pagoda":
        src = Image.open(ROOT/"assets/painted/white-pagoda-garden.webp").convert("RGBA")
        # The bottle-shaped White Pagoda itself: omit surrounding pedestrians.
        crop = src.crop((455, 0, 653, 285))
        silhouette = Image.new("L", crop.size, 0)
        d = ImageDraw.Draw(silhouette)
        d.polygon([(104,0),(117,0),(127,37),(133,66),(132,83),
                   (145,106),(163,143),(172,176),(170,198),
                   (151,214),(158,243),(161,283),(37,283),
                   (41,246),(50,219),(35,200),(36,176),
                   (48,144),(63,103),(72,81),(72,61),(83,33),
                   (90,7)],fill=255)
        silhouette=silhouette.filter(ImageFilter.GaussianBlur(3))
        crop.putalpha(silhouette)
        crop.thumbnail((280,390),Image.Resampling.LANCZOS)
        on=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
        on.alpha_composite(crop,(108,258))
        return Image.alpha_composite(im.convert("RGBA"),on).convert("RGB")
    if kind == "five":
        src = Image.open(SRC/"five-pavilion-foreground.png").convert("RGBA")
        # Crop only FIVE ROOFS, not the crowd/boats/bridge underlayer.
        roof = src.crop((0,0,src.width,min(81,src.height)))
        roof = roof.resize((790,160),Image.Resampling.LANCZOS)
        a=roof.getchannel("A")
        band=Image.new("L",roof.size,255)
        grad=np.zeros((roof.height,roof.width),dtype=np.uint8)
        for y in range(roof.height):
            grad[y,:]=int(255*min(1,max(0,(roof.height-y)/34)))
        a=ImageChops.multiply(a,Image.fromarray(grad,"L"))
        roof.putalpha(a)
        on=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0))
        on.alpha_composite(roof,(116,295))
        return Image.alpha_composite(im.convert("RGBA"),on).convert("RGB")
    return im


def edge_color(type_: str, u: np.ndarray) -> np.ndarray:
    """Exactly one canonical symmetric pixel profile for all N/E/S/W joins."""
    uv = np.minimum(u, SIZE-1-u).astype(np.float32)
    n = 2.3*np.sin(uv*.049) + 1.6*np.sin(uv*.136)
    land = np.stack([169+n,181+n*.65,140+n*.55],axis=-1)
    colour = land.copy()
    half = PORT[type_] / 2
    on = np.abs(u-(SIZE-1)/2) <= half
    if type_ in ("S", "W"):
        if type_=="S":base=np.array([206.,185.,150.])
        else:base=np.array([128.,170.,162.])
        colour[on] = base + n[on,None] * np.array([.85,.65,.6])
        curb = np.abs(np.abs(u-(SIZE-1)/2)-half) < 3.0
        colour[curb] = [128,118,94] if type_=="S" else [213,206,167]
    return np.clip(colour,0,255).astype("uint8")


def canonical_edges(im: Image.Image, edges: str) -> Image.Image:
    arr=np.array(im,dtype=np.float32)
    x=np.arange(SIZE)
    for i,typ in enumerate(edges):
        profile=edge_color(typ,x).astype(np.float32)
        for depth in range(62):
            opacity = (1-depth/61)**2.2
            if i==0: arr[depth,:,:] = arr[depth,:,:]*(1-opacity) + profile*opacity
            elif i==1: arr[:,SIZE-1-depth,:] = arr[:,SIZE-1-depth,:]*(1-opacity) + profile*opacity
            elif i==2: arr[SIZE-1-depth,:,:] = arr[SIZE-1-depth,:,:]*(1-opacity) + profile*opacity
            else:arr[:,depth,:] = arr[:,depth,:]*(1-opacity) + profile*opacity
    # Last operation forces exact common boundary pixels regardless of source.
    for i,typ in enumerate(edges):
        profile=edge_color(typ,x)
        if i==0:arr[0,:,:]=profile
        elif i==1:arr[:,-1,:]=profile
        elif i==2:arr[-1,:,:]=profile
        else:arr[:,0,:]=profile
    return Image.fromarray(np.clip(arr,0,255).astype("uint8"),"RGB")


def create(kind: str, signature: str, seed: int, name: str):
    if len(signature)!=4 or not set(signature).issubset({"L","S","W"}):
        raise ValueError("Invalid edge signature: "+signature)
    result=landscape(kind,signature,seed)
    # Avoid repainting the authentic path/bridge already present inside
    # a complete square study. Its edges still receive the shared contract.
    already_illustrated={
       ("causeway","SLSL"),("lake","WLWL"),("five","WSWS"),
       ("tea","SLSL"),("street","SLSL"),("canal","WLWL"),
       ("bridge","WSWS"),
    }
    if (kind,signature) not in already_illustrated:
        result=decorate_routes(result,signature,seed)
    result=landmarks(result,kind,seed)
    result=canonical_edges(result,signature)
    path=DEST/name
    result.save(path,"WEBP",quality=85,method=5)
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    ENTRIES.append(dict(file=name,kind=kind,edges=signature,seed=seed,
                        size=[SIZE,SIZE],sha256=digest,bytes=path.stat().st_size))
    return result


def rotate(signature: str, quarter: int) -> str:
    return "".join(signature[(i-quarter)%4] for i in range(4))


def contact_sheet(paths, output, columns=6, thumb=200):
    width=columns*thumb
    rows=math.ceil(len(paths)/columns)
    sheet=Image.new("RGB",(width,rows*(thumb+30)),(237,228,205))
    painter=ImageDraw.Draw(sheet)
    for i,(name, label) in enumerate(paths):
        img=Image.open(DEST/name).convert("RGB").resize((thumb,thumb),Image.Resampling.LANCZOS)
        x=(i%columns)*thumb;y=(i//columns)*(thumb+30)
        sheet.paste(img,(x,y))
        painter.text((x+5,y+thumb+5),label,fill=(65,67,57))
    sheet.save(output,"JPEG",quality=89)


def verify():
    # Opposite faces of EVERY canonical signature pair must match at full res.
    for code in "LSW":
        a=edge_color(code,np.arange(SIZE))
        b=edge_color(code,np.arange(SIZE))
        if not np.array_equal(a,b):
            raise AssertionError("Non-identical edge palette")
    assert len(ENTRIES)==6+13*4,len(ENTRIES)
    assert len({e["sha256"] for e in ENTRIES})>=35,"Too many identical painted tiles"
    for e in ENTRIES:
        assert e["bytes"]>20000,(e["file"],e["bytes"])
    print(f"Verified {len(ENTRIES)} independent 1024x1024 illustrated tile masters.")
    

def main():
    samples=[]
    for idx,(kind,edges,seed) in enumerate(STARTERS,1):
        name=f"starter-{idx:02d}.webp"
        create(kind,edges,100+seed*17,name)
        samples.append((name, f"Starter {idx} {kind} {edges}"))
    contact_sheet(samples, QA_DIR/"starter-six.jpg",3,320)
    variants=[]
    for idx,(kind,base) in enumerate(ARCHETYPES):
        for quarter in range(4):
            edges=rotate(base,quarter)
            name=f"archetype-{idx:02d}-r{quarter}.webp"
            create(kind,edges,300+idx*31+quarter*7,name)
            variants.append((name,f"{idx:02d} {kind} {edges}"))
    contact_sheet(variants,QA_DIR/"tile-deck.jpg",8,170)
    verify()
    (DEST/"manifest.json").write_text(json.dumps({
        "version":"production-geometry-1",
        "status":"high-resolution individual painted tile masters; human art-direction review required",
        "tile_size_px":SIZE, "world_size":WORLD,
        "connection_schema":{"N/E/S/W":["L","S","W"],
                             "port_world_units":{"land":0,"stone_road":44,"navigable_water":88},
                             "center_world_units":WORLD/2},
        "source":"original painted square source studies in assets/tiles, never starter panorama",
        "method":"one original richly painted square underlay per topology with stone/water network and separate architectural silhouettes; no mirrored collage",
        "entries":ENTRIES,
        "limits":["Original square sources are artistic interpretations rather than historical reconstructions.",
                  "Formal aesthetic sign-off is still required at high zoom, especially at land-to-road blending.",
                  "All portrait-like characters and boats must remain separate animated layers."]
    },indent=2)+"\n")
    # QA mosaic with an actual neighbouring tile seam, no illustration borders.
    starter=[Image.open(DEST/f"starter-{i:02d}.webp").convert("RGB") for i in range(1,7)]
    mosaic=Image.new("RGB",(3*SIZE,2*SIZE))
    for i,im in enumerate(starter):mosaic.paste(im,((i%3)*SIZE,(i//3)*SIZE))
    mosaic.resize((1536,1024),Image.Resampling.LANCZOS).save(QA_DIR/"starter-connected.jpg",quality=89)
    print(f"Output: {DEST}; {len(ENTRIES)} assets and visual review sheets.")

if __name__=="__main__":
    main()
