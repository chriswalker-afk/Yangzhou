#!/usr/bin/env python3
"""Recreate the Yangzhou V3 candidate roof-tile WebP from the original PNG.

Requires Pillow and NumPy. Does not modify the source painting.
The *exact* current prepared file's SHA-256 is checked by browser/Node tests.
Image encoding may depend on Pillow/libwebp versions; never silently replace
an accepted source file when regenerated output hash differs.
"""
from pathlib import Path
from PIL import Image
import numpy as np
import hashlib
import sys

EXPECTED_SOURCE = "731df70b0143848f3c1f0bc4b0c51e3d845fa7f09ca16cab8b2bba339853dd39"
EXPECTED_PREPARED = "8a3a7abeb08c4e34bb0134c9a39ba301000435bed5d3c63ccad3bd7a949e578a"
OUT = Path("assets/v3/wall-materials/wall-roof-tiles-01.webp")

def sha(data):
    return hashlib.sha256(data).hexdigest()

def prepare(original_png: Path, output_path: Path):
    data = original_png.read_bytes()
    if sha(data) != EXPECTED_SOURCE:
        raise ValueError("Source PNG differs from accepted generated Wall Roof-Tile Texture 01")
    image = Image.open(original_png).convert("RGB")
    if image.size != (2508, 627):
        raise ValueError(f"Unexpected source dimensions: {image.size}")
    resized = image.resize((1256, 314), Image.Resampling.LANCZOS)
    arr = np.asarray(resized).astype(np.float32).copy()
    difference = arr[:, -1, :] - arr[:, 0, :]
    # Cosmetic seamless wrap correction: no end caps or procedural roof motifs.
    for x in range(60):
        weight = np.cos((np.pi / 2) * x / 60) ** 2
        arr[:, x, :] += 0.5 * difference * weight
        arr[:, -1-x, :] -= 0.5 * difference * weight
    packed = np.clip(np.rint(arr), 0, 255).astype(np.uint8)
    edge = np.rint((packed[:, 0, :].astype(float) +
                    packed[:, -1, :].astype(float)) / 2).astype(np.uint8)
    packed[:, 0, :] = edge
    packed[:, -1, :] = edge
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(packed).save(output_path, "WEBP", quality=93, method=6, exact=True)
    result = output_path.read_bytes()
    print(f"{output_path}: {len(result)} bytes, SHA-256 {sha(result)}")
    if sha(result) != EXPECTED_PREPARED:
        raise ValueError(
            "Regenerated WebP differs from canonical prepared artwork. "
            "Do not overwrite GitHub candidate without visual and metadata review."
        )
if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        raise SystemExit("Usage: python scripts/prepare_v3_wall_roof_tiles.py source.png [destination.webp]")
    prepare(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) == 3 else OUT)
