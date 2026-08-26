# InterSacks asset audit

Audit date: 2026-08-26

This report records the human-reviewed catalogue decisions. The complete machine-readable inventory, dimensions, SHA-256 values, alpha detection, aHash, and dHash values are in `data/assets.json`. No source asset was renamed, modified, or deleted.

## Scan summary

- Design-directory image files scanned recursively: 79
- Product-directory image files scanned recursively: 10
- Broken image files: 0
- Unsupported files: 1 (`assets/Designs/FULL_OUTFITS/PROMPT.txt`; retained and ignored as a non-image)
- Exact duplicate groups: 10
- Human-confirmed likely visual duplicate groups: 1
- Published design records: 50
- Published garment records: 11
- Garment colour variants: 12

## Classification decisions

- Standalone illustrations and typographic graphics were classified as printable designs.
- Finished shirts, sets, skirts, caps, and model/mockup images were classified as product or marketing imagery, not printable artwork.
- The black and white blank T-shirt images are grouped as colour variants of `classic-tee` and are the only clean garment bases currently suitable for layered customization.
- Product montages that show front and back in one image were not split or treated as separate front/back source files. Their `backImage` is `null` because no independent back-view file exists.
- `assets/products/` is canonical whenever the same finished product also exists byte-for-byte under `assets/Designs/`.

## Exact duplicate groups and canonical files

1. `assets/Designs/FULL_OUTFITS/ChatGPT Image Jul 20, 2026, 01_42_43 AM.png` → canonical `assets/products/product-1.png`
2. `assets/Designs/FULL_OUTFITS/ChatGPT Image Jul 20, 2026, 01_53_03 AM.png` → canonical `assets/products/product-8.png`
3. `assets/Designs/Skirt_designs/ChatGPT Image Jul 20, 2026, 12_42_27 AM.png` → canonical `assets/products/product-6.png`
4. `assets/Designs/tshirt_designs/96235ecb662d6b17652af38a19ee3d5e.jpg` → canonical `assets/products/product-4.jpg`
5. `assets/Designs/tshirt_designs/ChatGPT Image Jul 20, 2026, 02_03_42 AM.png` → canonical `assets/products/product-7.png`
6. `assets/Designs/tshirt_designs/ChatGPT Image Jul 20, 2026, 02_47_40 AM.png` → canonical `assets/products/pantherPJ_Vest(blue&black) (1).png`
7. `assets/Designs/tshirt_designs/ChatGPT Image Jul 20, 2026, 02_54_42 AM.png` → canonical `assets/products/pantherPJ_longsleeve(blue&black) (2).png`
8. `assets/Designs/tshirt_designs/ChatGPT Image Jul 20, 2026, 12_46_31 AM.png` → canonical `assets/products/product-3.png`
9. `assets/Designs/tshirt_designs/white long sleeve.png` → canonical `assets/products/product-2.png`
10. `assets/Designs/tshirt_designs/white shirt.png` → canonical `assets/products/product-5.png`

## Likely visual duplicate

The following files contain the same “Make Money Not Friends” artwork with different backgrounds/exports:

- Excluded duplicate: `assets/Designs/7d228a53f900d9f652a03571b3a1c75c.jpg`
- Canonical: `assets/Designs/ART_PACKS/ChatGPT Image Jul 20, 2026, 01_21_03 AM.png`

The canonical PNG was selected because it is larger and has usable transparency. Automated similarity candidates remain in `docs/asset-audit.generated.md`; they are deliberately labelled review-required because simple perceptual hashes produce false positives for similarly framed garment photos.

## Unclassified and unpublished

- `assets/Designs/download (2).png` — mostly empty/transparent image; no confident customer-facing subject.
- `assets/Designs/Screenshot 2026-08-26 210744.png` — screenshot/reference strip, not artwork or a clean product image.
- `assets/Designs/WhatsApp Image 2026-07-20 at 16.09.56.jpeg` — shopping-app screenshot, not a clean source asset.

Other unpublished images were confidently classified as blank garment bases, alternate product concepts, product mockups, marketing images, or exact duplicate copies. They remain represented in `data/assets.json` and remain untouched on disk.

## Adding future assets

1. Add the source image under `assets/Designs/` or `assets/products/`.
2. Run `python scripts/build-asset-manifest.py`.
3. Review exact and perceptual duplicate warnings.
4. Add or update the curated customer-facing record in `js/data.js` with a stable ID, display metadata, pricing, sizes, and variant associations.
5. Test the storefront and customizer. The static site requires no Python at runtime and remains GitHub Pages-compatible.
