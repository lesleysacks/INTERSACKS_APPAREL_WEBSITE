# InterSacks Apparel — Phase 0 Asset Audit

**Audit evidence date:** GitHub API read-only inspection for this baseline.  
**Fresh file scan:** Not performed; no terminal/filesystem is available.  
**Safety:** No source asset was opened for modification, moved, renamed, or deleted.

## What is verified here

The GitHub API tree for the baseline commit contains `assets/`, `data/assets.json`, `scripts/build-asset-manifest.py`, and existing checked-in audit reports. The source script documents a recursive scan of `assets/Designs/` and `assets/products/`, image decoding, SHA-256 and perceptual hashes, and output to `data/assets.json` and `docs/asset-audit.generated.md`. The script was inspected but **not run**.

Consequently, all numerical inventory values below are historical report values, not independently revalidated current results. The code review does not prove every referenced file exists in the current filesystem or that no new file has been added since those reports were generated.

## Historical report inventory — unverified against current files

The checked-in `docs/asset-audit.md` (dated 2026-08-26) and generated companion report the following:

| Measure | Historical report | Current verification |
| --- | ---: | --- |
| Image records under `assets/Designs/` | 79 | Not freshly scanned |
| Image records under `assets/products/` | 10 | Not freshly scanned |
| Published design records | 50 | Curated source includes a 50-entry design manifest; no script/test run here |
| Published purchasable garments | 11 | Source and existing report state 11; no fresh execution |
| Planned garments | 18 | Source and existing report state 18; no fresh execution |
| Garment colour variants | 12 | Existing report only; not recalculated |
| Exact duplicate groups | 10 | Existing generated report only; not recalculated |
| Possible visual duplicate pairs | 24 | Existing generated report only; not recalculated |
| Broken image files | 0 | Historical scan only; not rechecked |
| Unsupported files | 1 | Historical scan identifies `assets/Designs/FULL_OUTFITS/PROMPT.txt` |

The historical report says the 10 exact duplicate groups pair a design-directory copy with a canonical product-directory file. It also documents a human-confirmed likely visual duplicate group involving “Make Money Not Friends.” The 24 algorithmic similarity pairs are expressly review-required candidates, not confirmed duplicates. Similarity must not drive automatic deletion.

## Missing files and broken references

- **Current missing image files:** Unknown; not freshly checked.
- **Current broken asset references:** Unknown; `scripts/referenced-assets.mjs` throws if a textual source reference does not resolve, but that build helper was not executed.
- The historical asset report records zero broken image files; that is not proof of current reference integrity.

## Unsupported and non-image files

The historical audit reports `assets/Designs/FULL_OUTFITS/PROMPT.txt` as the sole unsupported item because the scanner accepts image extensions only. It is a non-image text file, not a corrupt image; the historical report says it was retained. No unsupported-file scan was run for this baseline.

## Duplicate and human-review findings

- **Exact duplicate groups (historical, 10):** listed in `docs/asset-audit.generated.md`. These are byte-identical copies based on historical SHA-256 comparison, and the human report identifies product-directory canonical paths. Preserve both files until an authorized, separately reviewed asset-management change.
- **Possible visual pairs (historical, 24):** listed in `docs/asset-audit.generated.md`; derived from perceptual hash distance thresholding and require human review. They may reflect related garment colours, mockups, or composition rather than redundant assets.
- **Human-confirmed likely visual group (historical, 1):** `assets/Designs/7d228a53f900d9f652a03571b3a1c75c.jpg` and `assets/Designs/ART_PACKS/ChatGPT Image Jul 20, 2026, 01_21_03 AM.png`, per `docs/asset-audit.md`. This is a classification note, not authorization to remove either file.

## References, unreferenced assets, and product records

- The curated `src/data/catalogue.js` references 50 design entries and garment images; the build helper scans `src/` and the three HTML documents for `assets/...` paths. Textual source references and the image inventory are separate datasets.
- **Current unreferenced assets:** Not calculated. The historical reports do not establish this count.
- **Product images without matching product records:** Not calculated. The repo has 10 historical product-source records while the catalogue reports 11 orderable garments; those counts are not directly comparable because image paths may be shared or located under `assets/Designs/`. A proper path-level reconciliation is still required.
- **Asset references that do not resolve:** Not freshly checked; do not infer from a partial API listing or the historical broken-image count.

## Safe next audit procedure

When a terminal is available, first verify branch and clean working tree, then run `python scripts/build-asset-manifest.py` only after confirming required Python/Pillow availability. That script writes `data/assets.json` and `docs/asset-audit.generated.md`; compare the diff before retaining any generated changes, because this Phase 0 documentation task authorizes no changes to those existing files. Separately compare the curated catalogue and textual references to the scanned filesystem, review every visual candidate manually, and report findings without deleting or renaming assets.
