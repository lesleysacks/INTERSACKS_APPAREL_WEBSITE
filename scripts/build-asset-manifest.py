#!/usr/bin/env python3
"""Audit InterSacks image assets without modifying the originals.

Run from the repository root:
    python scripts/build-asset-manifest.py

The script writes data/assets.json and docs/asset-audit.generated.md. Curated
storefront metadata remains in js/data.js because image recognition cannot
reliably decide whether a file is printable artwork or a product photograph.
"""

from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SCAN_ROOTS = (ROOT / "assets" / "Designs", ROOT / "assets" / "products")
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}


@dataclass
class Asset:
    id: str
    type: str
    source: str
    sha256: str
    width: int
    height: int
    format: str
    transparent: bool
    ahash: str
    dhash: str


def bit_hash(bits: list[bool]) -> str:
    value = sum(int(bit) << index for index, bit in enumerate(bits))
    return f"{value:0{len(bits) // 4}x}"


def hashes(image: Image.Image) -> tuple[str, str]:
    grey = ImageOps.grayscale(image)
    small = grey.resize((8, 8), Image.Resampling.LANCZOS)
    pixels = list(small.get_flattened_data())
    average = sum(pixels) / len(pixels)
    ahash = bit_hash([pixel >= average for pixel in pixels])

    wide = grey.resize((9, 8), Image.Resampling.LANCZOS)
    pixels = list(wide.get_flattened_data())
    dhash = bit_hash([
        pixels[row * 9 + column] > pixels[row * 9 + column + 1]
        for row in range(8)
        for column in range(8)
    ])
    return ahash, dhash


def hamming(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


def scan() -> tuple[list[Asset], list[dict[str, str]], list[str]]:
    assets: list[Asset] = []
    broken: list[dict[str, str]] = []
    unsupported: list[str] = []
    counters = defaultdict(int)

    for scan_root in SCAN_ROOTS:
        asset_type = "design-source" if scan_root.name == "Designs" else "product-source"
        for path in sorted(scan_root.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(ROOT).as_posix()
            if path.suffix.lower() not in IMAGE_EXTENSIONS:
                unsupported.append(relative)
                continue
            try:
                payload = path.read_bytes()
                with Image.open(path) as image:
                    image.load()
                    alpha = image.convert("RGBA").getchannel("A")
                    ahash, dhash = hashes(image)
                    counters[asset_type] += 1
                    prefix = "design-source" if asset_type == "design-source" else "product-source"
                    assets.append(Asset(
                        id=f"{prefix}-{counters[asset_type]:03d}",
                        type=asset_type,
                        source=relative,
                        sha256=hashlib.sha256(payload).hexdigest(),
                        width=image.width,
                        height=image.height,
                        format=image.format or path.suffix.lstrip(".").upper(),
                        transparent=alpha.getextrema()[0] < 255,
                        ahash=ahash,
                        dhash=dhash,
                    ))
            except Exception as error:  # keep scanning and report the bad file
                broken.append({"source": relative, "error": str(error)})
    return assets, broken, unsupported


def main() -> None:
    assets, broken, unsupported = scan()
    exact = defaultdict(list)
    for asset in assets:
        exact[asset.sha256].append(asset.source)
    exact_groups = [paths for paths in exact.values() if len(paths) > 1]

    likely_pairs = []
    for index, left in enumerate(assets):
        for right in assets[index + 1:]:
            if left.sha256 == right.sha256:
                continue
            distance = min(hamming(left.ahash, right.ahash), hamming(left.dhash, right.dhash))
            if distance <= 5:
                likely_pairs.append({
                    "left": left.source,
                    "right": right.source,
                    "distance": distance,
                    "status": "review-required",
                })

    payload = {
        "schemaVersion": 1,
        "generatedBy": "scripts/build-asset-manifest.py",
        "assets": [asdict(asset) for asset in assets],
        "exactDuplicateGroups": exact_groups,
        "possibleVisualDuplicates": likely_pairs,
        "brokenFiles": broken,
        "unsupportedFiles": unsupported,
    }
    data_path = ROOT / "data" / "assets.json"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    design_count = sum(asset.type == "design-source" for asset in assets)
    product_count = sum(asset.type == "product-source" for asset in assets)
    lines = [
        "# Generated asset audit",
        "",
        "> This is the machine-generated companion to `docs/asset-audit.md`. ",
        "> Visual matches are candidates only and require human review.",
        "",
        f"- Design files scanned: {design_count}",
        f"- Product files scanned: {product_count}",
        f"- Exact duplicate groups: {len(exact_groups)}",
        f"- Possible visual duplicate pairs: {len(likely_pairs)}",
        f"- Broken files: {len(broken)}",
        f"- Unsupported files: {len(unsupported)}",
        "",
        "## Exact duplicate groups",
        "",
    ]
    for number, paths in enumerate(exact_groups, 1):
        lines.append(f"### Group {number}")
        lines.extend(f"- `{path}`" for path in paths)
        lines.append("")
    lines.extend(["## Possible visual duplicates", ""])
    for pair in likely_pairs:
        lines.append(
            f"- `{pair['left']}` ↔ `{pair['right']}` (distance {pair['distance']}; review required)"
        )
    report_path = ROOT / "docs" / "asset-audit.generated.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Scanned {design_count} design files and {product_count} product files")
    print(f"Wrote {data_path.relative_to(ROOT)} and {report_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
