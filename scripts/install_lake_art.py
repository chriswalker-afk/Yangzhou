#!/usr/bin/env python3
"""Install exported Slender West Lake WEBP tiles from an artwork ZIP.

Example: python scripts/install_lake_art.py /path/to/Yangzhou_Slender_West_Lake_Artwork.zip
Copies only the six expected .webp files to assets/lake/, then runs strict QA.
The manifest stays 'staged' if QA fails; no partial asset activation.
Requires Pillow and NumPy for strict QA.
"""
import json
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets/lake'
if len(sys.argv)!=2:
    raise SystemExit('Usage: python scripts/install_lake_art.py <artwork-zip>')
bundle=Path(sys.argv[1])
manifest_path=ART/'manifest.json'
manifest=json.loads(manifest_path.read_text())
expected=[row['file'] for row in manifest['tiles']]
with zipfile.ZipFile(bundle) as archive:
    for filename in expected:
        # Read only exact basename entries; do not extract arbitrary ZIP paths.
        if filename not in archive.namelist():
            raise SystemExit('Archive is missing required tile '+filename)
    for filename in expected:
        target=ART/filename
        target.write_bytes(archive.read(filename))
        print('Installed',target.relative_to(ROOT))
check=subprocess.run([sys.executable,str(ROOT/'scripts/check_lake_painted_art.py'),str(ART)],check=False)
if check.returncode:
    manifest['status']='staged'
    manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
    raise SystemExit('Art installed but not approved: fix geometry before deploying')
manifest['status']='approved'
manifest_path.write_text(json.dumps(manifest,indent=2)+'\n')
print('Pixel QA passed and painted master manifest approved. Complete manual/historical visual review before release.')
