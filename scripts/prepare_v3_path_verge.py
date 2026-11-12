#!/usr/bin/env python3
"""Rebuild Yangzhou V3 Path Verge Edge 01 lossless WebP from the actual source PNG.

Requires Pillow and NumPy (only when manually regenerating artwork).
Never rewrites the original source; CI verifies committed binary checksums.
"""
from pathlib import Path
from PIL import Image
import hashlib
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/v3/edges/sources/path-verge-edge-01-original.png"
OUTPUT = ROOT / "assets/v3/edges/path-verge-edge-01.webp"
EXPECTED_SOURCE_SHA256 = "9e8b458c04d2af39a0c4df1bf1c059b3532526958676c736f139edbc0828557f"
EXPECTED_BINARY_SHA256 = "5c99dfe5bf64ed71190a32246eec656f7df7561714045f0a984b3c25fe23e249"

def digest(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    assert digest(SOURCE) == EXPECTED_SOURCE_SHA256, "Source master changed"
    source = Image.open(SOURCE).convert("RGBA")
    assert source.size == (2172, 724)
    pix = np.array(source)
    pix[pix[:, :, 3] < 5] = 0
    # Keep hand-painted foliage while discarding nearly transparent margins.
    region = pix[269:463, 90:2082].copy()
    tmp = region.astype(np.float32)
    width = tmp.shape[1]
    span = 112
    for i in range(span):
        t = 0.5 * (1 + np.cos(np.pi * i / span))
        left = tmp[:, i, :].copy()
        right = tmp[:, width - 1 - i, :].copy()
        middle = (left + right) * 0.5
        tmp[:, i, :] = left * (1 - t) + middle * t
        tmp[:, width - 1 - i, :] = right * (1 - t) + middle * t
    processed = Image.fromarray(np.clip(tmp, 0, 255).astype("uint8"), "RGBA")
    assert processed.size == (1992, 194)
    a = np.asarray(processed)
    assert np.array_equal(a[:, 0, :], a[:, -1, :]), "Edge columns not identical"
    processed.save(OUTPUT, format="WEBP", lossless=True, method=6, exact=True)
    result = digest(OUTPUT)
    assert result == EXPECTED_BINARY_SHA256, f"Unexpected derivative digest {result}"
    print(f"Exact transparent Path Verge Edge 01 restored: {OUTPUT}")

if __name__ == "__main__":
    main()
