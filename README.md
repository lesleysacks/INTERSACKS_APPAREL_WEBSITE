# InterSacks Apparel

Premium South African streetwear. Built Different.

InterSacks Apparel is a static storefront for InterSacks Holdings. Customers browse the catalogue, customise a Classic Tee, keep a bag in the browser, and send the order on WhatsApp. There is no backend and no online payment.

The owner approved React 19 and Vite 8 for this storefront. That is an explicit exception to the original vanilla HTML, CSS, and JavaScript constraint. The site is not a vanilla JavaScript application.

## Technology

- React 19
- Vite 8
- JavaScript and JSX
- CSS3
- npm

The popover polyfill loads only when the browser has no native `popover` support. The project does not use a server, a database, or an online payment service.

## Local commands

```bash
npm install
npm test
npm run dev
npm run build
npm run preview
```

`npm test` runs `tests/storefront.test.js` with Node’s test runner. `npm run dev` serves the source. `npm run build` writes the static site to `dist/`. `npm run preview` serves that build.

Open the dev or preview URL. Do not open the source `index.html` as a file; the pages are module scripts built by Vite.

## Pages

`index.html`, `product.html`, and `cart.html` are separate documents. Each one mounts the React app on `#root`. `src/main.jsx` chooses the page from `data-page` on `<body>`.

- Home: announcement, catalogue, collections, shop filters, planned pieces, design archive, and contact.
- Customise: garment, colour, size, artwork, placement, quantity, and live price.
- Cart: line items, quantities, and the WhatsApp order.

Vite `base` is `./`, so scripts, styles, and catalogue images stay relative to the page. That matches the project site at `https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/`.

## Repository layout

```
index.html
product.html
cart.html
package.json
vite.config.js
src/
  main.jsx
  data/catalogue.js
  services/cart.js
  services/customizer.js
  services/orders.js
  context/CartContext.jsx
  components/
  pages/
  styles/global.css
tests/storefront.test.js
assets/
.github/workflows/pages.yml
```

Catalogue metadata lives in `src/data/catalogue.js`. Prices are whole rands. The bag is stored under the `intersacks-cart` key. Orders use WhatsApp number `27843252262`.

The catalogue lists 11 garments and 62 archive designs, including 12 InterSacks 2026 originals made in Canva (transparent 2048px PNGs in `assets/Designs/InterSacks_2026/`). Pieces whose ids are in `RIGHTS_HOLD` in `src/data/catalogue.js` are hidden from the shop because they show other people's trademarks, characters, real people, or another artist's signature; today that leaves 9 garments and 39 designs. Their files stay in `assets/`. Remove an id from `RIGHTS_HOLD` only once you own the rights or have written permission. The 18 planned garments have no price, colour, size, or image, and they cannot be added to the bag. Artwork can be placed only on the Classic Tee. The price depends on the print position: Front Small or Front Centre +R50, Back Centre +R80, Left Sleeve +R40. Designs are grouped into collections (Panther, Built Different, Mzansi, Mascot, Skull & Rose, Faith, Grind, Street, Wild, Pups). Back photographs are not in the catalogue, so the back view stays unavailable.

## Images

`assets/` in the repository is the full image library. The production build does not copy that whole library. `vite.config.js` copies only the image paths referenced by `src/` and the three HTML pages, and it keeps each file’s existing name and bytes. Source images are not renamed, recompressed, or deleted. The same build writes AVIF and WebP display variants from those originals; the originals remain the fallback.

## Deployment

Repository: https://github.com/lesleysacks/INTERSACKS_APPAREL_WEBSITE

Production URL: https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/

Publishing is the GitHub Actions workflow `.github/workflows/pages.yml`. It runs on every push to `main`, and can also be started by hand from the Actions tab. The workflow:

1. Runs `npm ci` to install dependencies.
2. Runs `npm test`.
3. Runs `npm run build`, which generates `dist/`.
4. Uploads `dist/` as the Pages artifact.
5. GitHub Pages deploys that artifact.

The Pages source for this workflow is GitHub Actions. Publishing the `main` branch itself would upload the unbuilt source, including `src/main.jsx`, and would not produce this site. FTP is not the deployment process.

The live URL updates a minute or two after a push to `main`, once the workflow finishes.

## Not included

Online payment, accounts, stock counts, a newsletter, and supplier or WooCommerce integrations are not part of this storefront.
