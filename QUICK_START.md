# InterSacks Apparel — Quick Start

The storefront is a React 19 application built with Vite 8, JavaScript, JSX, CSS3, and npm. The owner approved React for this project. It is not a vanilla JavaScript site.

There is no backend and no online payment. A bag stays in the browser, and the order is sent on WhatsApp.

## Run it locally

```bash
npm install
npm test
npm run dev
```

Open the URL Vite prints. The three pages are:

- `index.html` — home and shop
- `product.html` — customise
- `cart.html` — bag and WhatsApp order

## Check the production build

```bash
npm run build
npm run preview
```

`npm run build` writes `dist/`. `npm run preview` serves that folder. The build uses Vite `base` `./`, so asset paths stay relative.

## What a customer can do

- Browse the 11 garments that can be ordered.
- See planned garments marked as not available to order.
- Filter the shop by search, category, and sort.
- Customise a Classic Tee with one of 50 archive designs. Artwork adds R50. Placement is Front Small or Front Centre.
- Add a piece to the bag. The bag is stored as `intersacks-cart`.
- Send the order to WhatsApp number `27843252262`.

Catalogue data is in `src/data/catalogue.js`. Product images keep the paths and filenames already written there.

## Images

The repository keeps the complete `assets/` library. The production build copies only the images referenced by the storefront source. It does not rename or recompress them, and it does not delete the source files. It also writes AVIF and WebP display variants, leaving the original files as the fallback.

## Deployment

Repository: https://github.com/lesleysacks/INTERSACKS_APPAREL_WEBSITE

Production URL: https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/

The current deployment process is the manual workflow `.github/workflows/pages.yml`. Starting that workflow on GitHub runs `npm ci`, `npm test`, and `npm run build`, uploads `dist/`, and GitHub Pages deploys the upload. The workflow does not run on push.

Do not publish the `main` branch as the site, and do not upload the unbuilt source. FTP is not the deployment process. The Pages URL is not `intersacks-apparel`.

Local commands do not deploy or change the live website.
