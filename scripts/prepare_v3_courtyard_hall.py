#!/usr/bin/env python3
"""Rebuild the genuine Layer 2 courtyard-hall candidate without altering its source.
Requires Pillow and NumPy. Intended for verifying artwork derivatives, not V2.
"""
from pathlib import Path
from PIL import Image
import hashlib
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/v3/large/sources/courtyard-hall-01-original.png"
OUT = ROOT / "assets/v3/large/courtyard-hall-01.webp"
ORIGINAL_SHA = "ea66d963c1f86acbda5376267d5591f6b184bd36e864048b916b3748e1bfb1f9"
DERIVATIVE_SHA = "3f28402dd8ba4b6cffb1fac693da4306a94631f8359f850d1ee97af8b372bc31"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    if digest(SRC) != ORIGINAL_SHA:
        raise ValueError("Original artwork changed; do not silently replace the approved candidate source")
    im = Image.open(SRC).convert("RGBA")
    assert im.size == (1774, 887)
    px = np.asarray(im).copy()
    px[px[:, :, 3] < 5] = 0
    canvas = Image.fromarray(px, "RGBA").crop((165, 90, 1610, 797))
    assert canvas.size == (1445, 707)
    canvas.save(OUT, "WEBP", lossless=True, method=6, exact=True)
    if digest(OUT) != DERIVATIVE_SHA:
        raise ValueError("WebP derivative differs from committed artwork")
    print("Courtyard Hall 01 exactly reproduced in lossless transparent WebP")


if __name__ == "__main__":
    main()