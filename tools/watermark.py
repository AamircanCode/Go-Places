#!/usr/bin/env python3
"""
GO PLACES — bake the "© Go Places" watermark into place photos
=============================================================
Run this after adding new photos to images/ (needs Python 3 and Pillow:
`pip install Pillow`):

    python3 tools/watermark.py            # every .jpg/.jpeg under images/
    python3 tools/watermark.py images/x.jpg images/berlin/y.jpg

The mark is drawn into the pixels, so it stays on the photo even if someone
saves or screenshots it. Each processed file is tagged (a JPEG comment plus the
EXIF Copyright field), and tagged files are skipped, so running it again never
stamps a photo twice.

Keep the untouched originals somewhere outside this repo: whatever is in the
repo is what the website serves.
"""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps

TEXT = "© Go Places"
MARKER = b"GoPlaces-watermarked"
COPYRIGHT = "Copyright Go Places. All rights reserved."  # EXIF text is ASCII-only
FONTS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "images")


def font(size):
    for path in FONTS:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def already_marked(im):
    return MARKER in (im.info.get("comment") or b"")


def stamp(im):
    im = ImageOps.exif_transpose(im).convert("RGB")
    w, h = im.size
    short = min(w, h)
    f = font(max(14, round(short * 0.035)))
    margin = round(short * 0.03)

    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    l, t, r, b = d.textbbox((0, 0), TEXT, font=f)
    x = w - margin - (r - l) - l
    y = h - margin - (b - t) - t
    shadow = max(1, round(short * 0.002))
    d.text((x + shadow, y + shadow), TEXT, font=f, fill=(0, 0, 0, 120))
    d.text((x, y), TEXT, font=f, fill=(255, 255, 255, 200))
    return Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB")


def process(path):
    im = Image.open(path)
    if already_marked(im):
        return "skipped (already marked)"
    out = stamp(im)
    exif = Image.Exif()
    exif[0x8298] = COPYRIGHT  # EXIF Copyright
    out.save(path, "JPEG", quality=86, optimize=True, progressive=True,
             comment=MARKER, exif=exif.tobytes())
    return "marked"


def main(args):
    files = args or sorted(set(
        p for ext in ("jpg", "jpeg", "JPG", "JPEG")
        for p in glob.glob(os.path.join(ROOT, "**", "*." + ext), recursive=True))
    )
    for path in files:
        print(os.path.relpath(path), "→", process(path))


if __name__ == "__main__":
    main(sys.argv[1:])
