# InterSacks Apparel — Phase 0 Test and Build Report

**Target branch:** `feature/phase-0-repository-baseline`  
**Baseline commit:** `136d20de5abaf9dbbc24d19b1f83a0988832c81f`  
**Execution method:** GitHub API source inspection only; no shell, terminal, or local filesystem was available.

## Commands requested

`package.json` defines `npm test` as `node --test tests/storefront.test.js` and `npm run build` as `node scripts/run.mjs build`. `scripts/run.mjs` first invokes `scripts/vendor-fonts.mjs` and `scripts/generate-display-images.mjs`, then Vite. The build therefore writes generated image manifests/variants and `dist` locally (generated outputs are ignored by `.gitignore`).

| Command | Result | Evidence / limitation |
| --- | --- | --- |
| `python scripts/build-asset-manifest.py` | Not run | No terminal/filesystem; current asset audit remains unverified. |
| `npm ci` | Not run | No terminal/filesystem; dependency installation was not attempted. |
| `npm test` | Not run | No test result can be claimed. The test file was read through the API. |
| `npm run build` | Not run | No build result can be claimed. Build behavior was inspected in source only. |

No dependency installation or code execution occurred. No test/build failures or warnings were observed because the commands were not executed; this does not mean they pass.

## Test coverage visible in source (not execution)

`tests/storefront.test.js` uses Node’s built-in test runner and includes checks for store configuration, catalogue counts and data, price calculations, cart add/update/remove behavior, persistence using memory storage, WhatsApp message formatting, customizer state, planned-garment purchase rejection, filtering/sorting, and quantity validation. The inspected file is evidence of test definitions only, not a passing test run.

## What remains unverified

- Package lock installation and compatibility with the current Node/npm runtime.
- Actual test pass/fail results.
- Vite production build and referenced-asset validation.
- Font-vendoring network behavior and Sharp image generation.
- Fresh asset counts, broken references, duplicate groups, unreferenced assets, and catalogue/image reconciliation.
- Browser rendering, responsive behavior, accessibility, SEO rendering, and manual acceptance checklist.

Run the asset script and npm commands in a verified clean local feature-branch checkout before treating this report as an execution baseline. Preserve and report all errors verbatim; do not change application code or dependencies simply to obtain a pass.
