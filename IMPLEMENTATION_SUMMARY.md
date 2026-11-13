# InterSacks Apparel — Implementation Summary

The current storefront is a React 19 interface on the InterSacks catalogue, cart, and WhatsApp order flow. The owner approved React 19 and Vite 8. This is an explicit exception to the original vanilla HTML, CSS, and JavaScript constraint. The storefront is not vanilla JavaScript.

## Stack

- React 19 and React DOM
- Vite 8, with `base` set to `./`
- JavaScript and JSX
- CSS3 in `src/styles/global.css`
- npm
- Node’s test runner for `tests/storefront.test.js`

`@oddbird/popover-polyfill` is loaded only when `popover` is missing. There is no Tailwind, Bootstrap, Vue, Angular, or Next.js. There is no application server, database, or payment provider.

## How the pages are built

`index.html`, `product.html`, and `cart.html` are separate HTML documents. Each document has a `#root` element and a `data-page` value. `src/main.jsx` renders one of `HomePage`, `ProductPage`, or `CartPage` inside `CartProvider`.

| Area | Module |
| --- | --- |
| Catalogue, prices, planned garments, designs | `src/data/catalogue.js` |
| Bag and `intersacks-cart` | `src/services/cart.js` |
| Garment, colour, size, artwork, placement, quantity | `src/services/customizer.js` |
| WhatsApp message and `wa.me` link | `src/services/orders.js` |
| Shared bag state | `src/context/CartContext.jsx` |
| Header, menu, footer | `src/components/Chrome.jsx` |

## Catalogue behaviour

- 11 garments can be ordered. Prices are whole rands, from R349 to R899.
- 18 planned garments stay visible as not available to order. They have no price, colours, sizes, or image, and they cannot be purchased.
- 50 designs are in the archive. A design adds R50 and is compatible with the Classic Tee only.
- Placements are Front Small (`front-small`) and Front Centre (`front-center`).
- Colour records have no back image, so the back control stays unavailable.
- Orders go to WhatsApp `27843252262` with the brand name InterSacks Apparel and the tagline Built Different.
- The site states that nothing is charged online.

## Production images

`assets/` remains the complete source library. `vite.config.js` copies into `dist/assets` only the files referenced by `src/` and the three HTML entry points. Referenced product images are copied unchanged. The build also writes AVIF and WebP display variants into `dist/assets/display`. Unreferenced files stay in the repository and are left out of `dist/`.

## Deployment

Repository: https://github.com/lesleysacks/INTERSACKS_APPAREL_WEBSITE

Production URL: https://lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE/

`.github/workflows/pages.yml` is a manually triggered GitHub Actions workflow. A run installs dependencies with `npm ci`, runs `npm test`, generates `dist/` with `npm run build`, uploads that directory, and GitHub Pages deploys the uploaded artifact. Pushing a branch does not deploy.

The workflow publishes the built `dist/` directory. It does not publish the `main` branch as raw source, and it does not use FTP. The project Pages path is `INTERSACKS_APPAREL_WEBSITE`, not `intersacks-apparel`.

The live site does not change until that workflow is run on GitHub. This implementation summary does not deploy it.

## Outside this storefront

Accounts, inventory counts, online payment, a newsletter, and WooCommerce or supplier APIs are not implemented.
