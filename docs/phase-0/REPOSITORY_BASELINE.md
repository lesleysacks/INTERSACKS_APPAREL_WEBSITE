# InterSacks Apparel — Phase 0 Repository Baseline

**Baseline reference:** `136d20de5abaf9dbbc24d19b1f83a0988832c81f`  
**Target branch:** `feature/phase-0-repository-baseline`  
**Audit method:** Read-only inspection through GitHub API. No local clone or terminal was available.

## Evidence and limits

The GitHub API branch listing was checked immediately before writing these documents. It showed:

- `feature/phase-0-repository-baseline` at `136d20de5abaf9dbbc24d19b1f83a0988832c81f`.
- `main` at the same SHA.
- `backup/vanilla-main-cdf2b33` at `cdf2b336744f2c3b7cbade7c8016ad91ac01e4c9`, matching its previously recorded head.

The API confirms remote refs and repository file contents, not a local Git checkout. Local working-tree status, `git fetch`, checkout, and clean status could not be verified. No tests, asset scan, or build were executed. Inventory results below are identified as checked-in historical reports, not a fresh scan.

## Repository structure

```text
.github/workflows/pages.yml   Manual GitHub Pages build/deploy workflow
assets/                       Source design, product, logo, hero, icon, and review media
data/assets.json              Generated image metadata and historical asset analysis
public/                       Vendored fonts, robots.txt, sitemap.xml
scripts/                      Asset manifest, image generation, font, and run helpers
src/
  components/                 Shared header/footer, photo, product-card components
  context/                    Shared React cart provider
  data/                       Curated catalogue and product/design metadata
  lib/                        Image layout/display helpers and popover polyfill
  pages/                      Home, customizer, and cart page components
  services/                   Cart, customizer, and WhatsApp order logic
  styles/                      Global responsive stylesheet
tests/storefront.test.js       Node test-runner coverage
index.html                     Home entry document
product.html                   Customizer entry document
cart.html                      Cart entry document
package.json                   npm scripts and dependencies
vite.config.js                 Multi-page Vite build and asset handling
```

Other top-level documentation includes `README.md`, `QUICK_START.md`, `IMPLEMENTATION_SUMMARY.md`, `ACCEPTANCE_TESTS.md`, and the existing `docs/asset-audit.md` and `docs/asset-audit.generated.md` reports.

## Architecture and entry points

This is a static storefront using React 19, React DOM, Vite 8, JavaScript/JSX, CSS, and npm. The owner-approved React/Vite architecture is explicit in the README; this audit does not propose replacing it.

`index.html`, `product.html`, and `cart.html` mount a `#root` and set `data-page`. `src/main.jsx` selects `HomePage`, `ProductPage`, or `CartPage` and wraps the page in `CartProvider`. `src/data/catalogue.js` is the curated storefront source of garment, design, price, and placement data. `vite.config.js` configures the three Vite inputs with relative `base: './'`; `scripts/referenced-assets.mjs` finds source references, and the Vite plugin copies referenced originals plus generated display variants into the build output.

## Existing customer functionality

Observed in the inspected source and documentation:

- Browse available garments and planned, unavailable concepts; filter and sort the available catalogue.
- Search and browse design archive entries.
- Customize garments with colour, size, compatible artwork, placement, and quantity, with live price calculation. The archive artwork/customization is limited to the Classic Tee in the curated data.
- Add items to a browser cart, combine matching line items, update quantities, remove or clear items, and display totals.
- Store the cart under `intersacks-cart` in browser `localStorage`, with a memory-storage fallback when browser storage is unavailable.
- Generate a prefilled WhatsApp order link for desk number `27843252262`; the site clearly states that it does not take online payment.
- Show image fallbacks and use responsive AVIF/WebP variants when the generated display manifest is present.

The current browser customizer is not a backend order-submission or approval system.

## Dependencies and commands

`package.json` lists runtime dependencies `react`, `react-dom`, and `@oddbird/popover-polyfill`; dev dependencies are `@vitejs/plugin-react`, `sharp`, and `vite`. The popover polyfill is dynamically imported only when the browser lacks native popover support. No server, database, payment provider, or account subsystem is declared.

Available package scripts: `npm test` (`node --test tests/storefront.test.js`), `npm run build` (`node scripts/run.mjs build`), `npm run dev`, and `npm run preview`. `scripts/run.mjs` invokes font vendoring and generated display-image processing before starting Vite. Exact execution outcomes are recorded in `TEST_AND_BUILD_REPORT.md`; none were run in this audit environment.

## Deployment architecture

The inspected `.github/workflows/pages.yml` has `workflow_dispatch` as its sole trigger. It runs `npm ci`, `npm test`, `npm run build`, uploads `dist`, then deploys it through GitHub Pages Actions. The uploaded artifact and deployment input both use `github-pages-${{ github.run_id }}-${{ github.run_attempt }}`. No automatic push deployment trigger is present in this workflow. The workflow was read only; no deployment was triggered and the live site was not changed.

## SEO, responsive design, and accessibility observations

The three HTML documents include page-specific titles/descriptions, canonical URLs, and Open Graph/Twitter metadata; the home document includes `ClothingStore` JSON-LD. `public/robots.txt` allows crawling and points to `public/sitemap.xml`, which lists the three pages.

`src/styles/global.css` uses responsive container queries, visible `:focus-visible` outlines, reduced-motion handling, forced-colour overrides, and coarse-pointer target sizing. Components use semantic landmarks, labels, fieldsets/legends, status/live regions, and image alt text/fallbacks. This is source inspection only, not a browser, screen-reader, contrast, keyboard, or Lighthouse verification. Manual acceptance checks remain outstanding.

## Risks and technical debt to carry forward

- This is a static client application. Browser cart contents and prices are client-controlled; they are not an authoritative order or payment record.
- There is no backend approval workflow, secure administrator account, order persistence, payment service, inventory control, or server-managed artwork upload.
- Do not treat frontend validation as a security boundary. Future submissions and prices need server-side validation and authoritative storage.
- `scripts/vendor-fonts.mjs` may fetch remote Google Fonts if the local stamp check does not match; builds may depend on network availability in that case.
- Asset health, current missing/unreferenced files, and product-image-to-product-record reconciliation have not been recalculated in this baseline. See `ASSET_AUDIT.md`.
- Browser, assistive-technology, visual regression, and responsive acceptance coverage has not been executed as part of this audit.

## Recommendations

1. Keep the current React/Vite architecture and source assets intact; establish repeatable test/build and asset-audit evidence before feature work.
2. Complete human review of image similarity candidates and reconcile references without automatic removal or renaming.
3. Design and threat-model the future approval/order backend before building a customer design-submission feature; see `PHASE_0_NEXT_STEPS.md`.
4. Run the existing manual acceptance checklist across supported viewports and assistive technology before relying on its UX/accessibility claims.
