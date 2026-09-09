#!/usr/bin/env python3
"""
Optional. Shrinks everything in photos-original/ into public/photos/ so the
site stays quick to load on a phone.

    python3 scripts/optimize-photos.py

Needs Pillow:  pip install Pillow
You do NOT have to run this -- you can drop a jpg straight into public/photos/
and it will work. This just makes big camera photos load faster.
"""

import os
import sys
import glob

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install Pillow")

SRC = "photos-original"
DST = os.path.join("public", "photos")
MAX_EDGE = 1200
QUALITY = 80

os.makedirs(DST, exist_ok=True)

files = sorted(
    f
    for pattern in ("*.jpg", "*.jpeg", "*.JPG", "*.png", "*.PNG", "*.heic", "*.HEIC")
    for f in glob.glob(os.path.join(SRC, pattern))
)

if not files:
    sys.exit(f"No images found in {SRC}/")

total = 0
for path in files:
    name = os.path.basename(path)
    stem = os.path.splitext(name)[0].replace("'", "").replace(" ", "-")
    out = os.path.join(DST, stem + ".jpg")
    try:
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    except Exception as exc:  # a HEIC without the plugin, say
        print(f"  skipped {name}: {exc}")
        continue
    im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    kb = os.path.getsize(out) // 1024
    total += kb
    print(f"  {stem + '.jpg':34s} {im.size[0]}x{im.size[1]}  {kb} KB")

print(f"\n{len(files)} photos -> {DST}  ({total} KB total)")
