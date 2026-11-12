#!/usr/bin/env python3
"""Intake two artist-authored V3 Layer 2 candidate sprites from a local ZIP.

No generated placeholders are permitted. The ZIP is furnished separately after
visual review and must contain the exact original and lossless prepared files.
"""
from pathlib import Path
import hashlib
import json
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PACK_PATH = "assets/v3/large/"
EXPECTED = {
 "willow-tree-01-original.png": "716f2e40aefb9486b3246aa91f8c2e662ca069bcab3095debf3be124448b82a2",
 "willow-tree-01.webp": "8e41982dd8d59a5476d5430cb865d9f86578bb69e9bc69c94c30373d5392fc9e",
 "garden-rockery-01-original.png": "5a99b015099006be344d0f4974b8a353b4d1a1e57a7909e31d9df3e5ec278007",
 "garden-rockery-01.webp": "3a22cb438726d4a88cd9d24d6cf9be47faabd7ecff3aa604a9d3b5d131580e89",
}

def main():
 if len(sys.argv) != 2:
  raise SystemExit("Usage: python scripts/import_v3_layer2_artwork.py yangzhou-v3-layer2-artwork-package.zip")
 with zipfile.ZipFile(sys.argv[1]) as archive:
  pending = {}
  for filename, expected in EXPECTED.items():
   member = PACK_PATH + ("sources/" if filename.endswith("-original.png") else "") + filename
   data = archive.read(member)
   actual = hashlib.sha256(data).hexdigest()
   if actual != expected:
    raise SystemExit(f"Integrity check failed for {filename}: {actual}")
   pending[ROOT / member] = data
  for target, data in pending.items():
   target.parent.mkdir(parents=True, exist_ok=True)
   target.write_bytes(data)
   print(f"Wrote {target.relative_to(ROOT)} ({len(data)} bytes)")
 print("Artwork candidates imported. Review visually before registering in the live sprite manifest.")

if __name__ == "__main__":
 main()
