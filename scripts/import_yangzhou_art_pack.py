#!/usr/bin/env python3
"""Install one verified Yangzhou artwork ZIP into this repository.

No arbitrary ZIP extraction, network calls, shell commands or image rotations.
Fixed Slender West Lake art and the existing game manifest stay untouched.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import zipfile

PACK_NAME = 'yangzhou-art-variants-v1.zip'
PACK_SHA256 = 'e279be1cf38c93ea1ff3168653c18f1670889dea7d02a45c082babda07e35a7d'
EXPECTED_COUNT = 19
ALLOWED_SIGNATURES = {
    'garden-grove': {'LLLL'},
    'street-straight': {'SLSL', 'LSLS'},
    'street-bend': {'SSLL', 'LSSL', 'LLSS', 'SLLS'},
    'market-cross': {'SSSS'},
    'canal-straight': {'WLWL', 'LWLW'},
    'canal-bend': {'WWLL', 'LWWL', 'LLWW', 'WLLW'},
    'stone-bridge': {'WSWS', 'SWSW'},
    'canal-junction': {'WWWL', 'LWWW', 'WLWW', 'WWLW'},
}

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def safe_name(name: str) -> bool:
    path = PurePosixPath(name)
    return bool(name) and not path.is_absolute() and '..' not in path.parts and '\\' not in name and str(path) == name

def import_pack(root: Path, remove_zip: bool = True) -> dict:
    root = root.resolve()
    source = root / 'incoming' / PACK_NAME
    if not source.is_file():
        raise FileNotFoundError(f'Upload the ZIP to {source}')
    if source.stat().st_size > 25 * 1024 * 1024:
        raise ValueError('The ZIP exceeds the supported browser upload size')
    if sha256(source.read_bytes()) != PACK_SHA256:
        raise ValueError('ZIP checksum mismatch: use the supplied original pack')

    with zipfile.ZipFile(source) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)) or not all(safe_name(n) for n in names):
            raise ValueError('Unsafe or duplicate archive paths')
        if len(names) > 60 or sum(x.file_size for x in archive.infolist()) > 25 * 1024 * 1024:
            raise ValueError('Unexpected expanded archive size')
        manifest_name = 'assets/v2/variant-pools.json'
        runtime_name = 'assets/v2/variant-runtime.js'
        for required in (manifest_name, runtime_name, 'gallery.html', 'tile-contact-sheet.jpg', 'README.md'):
            if required not in names:
                raise ValueError('Missing ZIP member: ' + required)
        m = json.loads(archive.read(manifest_name))
        if m.get('schemaVersion') != 1 or m.get('imagePixels') != 1254:
            raise ValueError('Wrong artwork package schema')
        if m.get('packId') != 'yangzhou-all-painted-tile-variants-2026-11-10':
            raise ValueError('Wrong artwork collection')
        used = {manifest_name, runtime_name}
        seen = set()
        images = []
        for pool in m.get('pools', []):
            archetype, edges = pool.get('archetype'), pool.get('edges')
            if edges not in ALLOWED_SIGNATURES.get(archetype, set()):
                raise ValueError(f'Incorrect tile topology {archetype}:{edges}')
            key = (archetype, edges)
            if key in seen:
                raise ValueError('Duplicate artwork pool')
            seen.add(key)
            for art in pool.get('variants', []):
                path = 'assets/v2/' + str(art.get('file', ''))
                if not path.startswith('assets/v2/variants/' + archetype + '/') or not path.endswith('.webp'):
                    raise ValueError('Image path does not match its tile family')
                if not safe_name(path) or path in used or path not in names:
                    raise ValueError('Duplicate, unsafe or missing painting: ' + path)
                if art.get('width') != 1254 or art.get('height') != 1254:
                    raise ValueError('Incorrect painting dimensions')
                raw = archive.read(path)
                if raw[:4] != b'RIFF' or raw[8:12] != b'WEBP':
                    raise ValueError('Not a WebP image: ' + path)
                if art.get('bytes') != len(raw) or art.get('sha256') != sha256(raw):
                    raise ValueError('Image hash does not match its manifest: ' + path)
                used.add(path)
                images.append((path, raw))
        if len(images) != EXPECTED_COUNT or len(seen) != 11:
            raise ValueError('Expected exactly 19 distinct images and 11 topology groups')
        # Check everything before writing anything to the repository.
        writes = [(manifest_name, archive.read(manifest_name)),
                  (runtime_name, archive.read(runtime_name)),
                  *images,
                  ('variant-gallery.html', archive.read('gallery.html')),
                  ('artwork-variants-preview.jpg', archive.read('tile-contact-sheet.jpg')),
                  ('docs/ARTWORK-VARIANTS-README.md', archive.read('README.md'))]
        for name, raw in writes:
            destination = (root / name).resolve()
            if not destination.is_relative_to(root):
                raise ValueError('Unsafe extraction target')
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(raw)

    # Opt in to runtime random scenery once images exist. Other route logic,
    # lake starters, original master PNGs and layout studies remain intact.
    for html_name in ('index.html', 'tile-lab-v2.html'):
        page = root / html_name
        contents = page.read_text(encoding='utf-8')
        tag = '<script src="tile-art-v2.js"></script>'
        with_variants = tag + '\n<script src="assets/v2/variant-runtime.js"></script>'
        if with_variants not in contents:
            if tag not in contents:
                raise ValueError('Could not find V2 renderer in ' + html_name)
            page.write_text(contents.replace(tag, with_variants, 1), encoding='utf-8')

    if remove_zip:
        source.unlink()
    print('Imported 19 standalone paintings in 11 topology-matched random-variation pools')
    print('Existing game masters, route rules and lake artwork were preserved')
    return {'images':len(images), 'pools':len(seen)}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--repo-root',type=Path,default=Path(__file__).resolve().parents[1])
    parser.add_argument('--keep-zip',action='store_true')
    args = parser.parse_args()
    import_pack(args.repo_root, remove_zip=not args.keep_zip)
