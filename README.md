# InterSacks Apparel — Website

Premium South African Streetwear. Built Different.

---

## Folder Structure

```
intersacks-apparel/
│
├── index.html              ← The whole site lives here
│
├── css/
│   ├── style.css           ← All styling, colours, layout
│   └── responsive.css      ← Mobile / tablet breakpoints
│
├── js/
│   └── app.js              ← Menu, scroll, animations
│
├── assets/
│   ├── logo/               ← Drop logo files here
│   ├── hero/               ← Hero + about background images
│   ├── products/           ← Product + Instagram images
│   ├── icons/              ← Any SVG icons
│   └── backgrounds/        ← Section backgrounds
│
└── README.md               ← This file
```

---

## How to Add a Product

**Step 1** — Drop the image into `assets/products/`

```
product-5.jpg
```

**Step 2** — Open `index.html` and find a product card block that looks like this:

```html
<div class="product-card" data-animate>
  <div class="product-img-wrap">
    <!-- Replace with: <img src="assets/products/product-1.jpg" alt="Oversized Skull Tee"> -->
    <div class="img-placeholder">
      <span class="ph-label">Product Image</span>
      <p class="ph-hint">assets/products/product-1.jpg</p>
    </div>
    ...
  </div>
  <div class="product-info">
    <h3 class="product-name">Oversized Skull Tee</h3>
    <div class="product-stars">★★★★★</div>
    <p class="product-price">R349</p>
    <p class="product-status coming-soon">Coming Soon</p>
  </div>
</div>
```

**Step 3** — Replace the placeholder `<div>` with a real image tag:

```html
<img src="assets/products/product-5.jpg" alt="Your Product Name">
```

**Step 4** — Update the name, price and status:

```html
<h3 class="product-name">New Product Name</h3>
<p class="product-price">R499</p>
<p class="product-status in-stock">In Stock</p>
```

**Status options:**

| Class | Label | Use When |
|---|---|---|
| `coming-soon` | Coming Soon | Not launched yet |
| `in-stock` | In Stock | Available to buy |
| `sold-out` | Sold Out | Finished |

Done. No coding needed.

---

## How to Replace the Hero Image

1. Add your image: `assets/hero/hero-bg.jpg`
2. In `css/style.css`, find `.hero-bg` and replace the gradient with:

```css
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('../assets/hero/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}
```

---

## How to Update Contact Info

In `index.html`, find the contact section and replace:

```html
<!-- Email -->
<a href="mailto:hello@intersacks.co.za" ...>
  <p>hello@intersacks.co.za</p>
</a>

<!-- WhatsApp -->
<a href="https://wa.me/27000000000" ...>
  <p>+27 000 000 000</p>
</a>

<!-- Instagram -->
<a href="https://instagram.com/YOUR_HANDLE" ...>
  <p>@yourhandle</p>
</a>

<!-- Facebook -->
<a href="https://facebook.com/YOUR_PAGE" ...>
  <p>InterSacks Apparel</p>
</a>
```

---

## How to Add Your Logo

1. Save your logo as `assets/logo/logo.png` (transparent background, PNG or SVG)
2. In `index.html`, find the navbar logo section:

```html
<a href="#home" class="nav-logo">
  <!-- Replace with: <img src="assets/logo/logo.png" alt="InterSacks Apparel"> -->
  <span class="logo-text">INTERSACKS</span>
</a>
```

3. Replace with:

```html
<a href="#home" class="nav-logo">
  <img src="assets/logo/logo.png" alt="InterSacks Apparel" style="height: 40px; width: auto;">
</a>
```

---

## Colours

| Name | Hex | Where |
|---|---|---|
| Black | `#111111` | Background |
| White | `#FFFFFF` | Text |
| Blue | `#0066FF` | Accent, buttons, stars |

To change the accent colour sitewide, open `css/style.css` and update:

```css
--blue: #0066FF;
```

---

## Fonts

| Role | Font |
|---|---|
| Headings | Bebas Neue |
| Body | Poppins |

Loaded from Google Fonts in `<head>` — no install needed.

---

## Future Sections (Already Hidden)

When you're ready to add more, these sections are outlined in the design doc and can be added below the existing collections grid:

- Hoodies grid
- Sweatpants grid
- Accessories grid
- Limited Drops
- Lookbook
- Newsletter signup
- FAQ accordion
- Customer Reviews

Add each as a new `<section>` block following the same card pattern used in the collections section.

---

## Deployment

This site is pure HTML/CSS/JS — no server needed.

**Options:**
- Drag the folder into [Netlify Drop](https://app.netlify.com/drop) — free, instant
- Upload to any web host via FTP
- GitHub Pages (free hosting with a GitHub account)

---

## Browser Support

Supports all modern browsers: Chrome, Firefox, Safari, Edge.
Mobile tested at 320px, 375px, 414px widths.

---

© 2025 InterSacks Apparel
