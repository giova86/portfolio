#!/usr/bin/env python3
"""Regenerate images.js manifests for static/gallery/<slug>/ folders.

Run after adding/removing images from a gallery folder:
    python3 scripts/generate_gallery_manifests.py

images.js (not images.json) is used deliberately: it's loaded via a plain
<script> tag, which works when the site is opened directly as a file://
URL. A fetch()'d JSON manifest would fail there due to CORS.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GALLERY_DIR = ROOT / "static" / "gallery"
EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}


def main():
    for folder in sorted(GALLERY_DIR.iterdir()):
        if not folder.is_dir():
            continue
        images = sorted(
            f.name for f in folder.iterdir()
            if f.is_file() and f.suffix.lower() in EXTENSIONS
        )
        manifest = folder / "images.js"
        manifest.write_text(
            "window.__galleryImages = window.__galleryImages || {};\n"
            f"window.__galleryImages[{json.dumps(folder.name)}] = {json.dumps(images)};\n"
        )
        print(f"{folder.name}: {len(images)} image(s)")


if __name__ == "__main__":
    main()
