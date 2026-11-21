/* Captures real screenshots of the InterSacks site for the promo video.
   Run against a local `vite preview` (default http://localhost:4173). */
const { chromium, devices } = require('playwright')
const path = require('path')
const BASE = process.env.SITE || 'http://localhost:4173'
const OUT = path.join(__dirname, 'shots')
const shot = (name) => path.join(OUT, name)
const tap = (loc) => loc.evaluate((el) => el.click())

;(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] })
  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const p = await desk.newPage()
  await p.addInitScript(() => document.documentElement.classList.add('promo-capture'))

  // Home: hero, shop grid, lookbook.
  await p.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
  await p.screenshot({ path: shot('home-hero.png') })
  await p.locator('#shop').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
  await p.waitForTimeout(1200)
  await p.screenshot({ path: shot('home-shop.png') })
  await p.locator('#lookbook').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
  await p.waitForTimeout(1200)
  await p.screenshot({ path: shot('home-lookbook.png') })

  // Quick add on the Panther Vest card.
  const vest = p.locator('#shop .product-card', { hasText: 'Panther Vest' })
  await vest.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await p.waitForTimeout(600)
  await vest.screenshot({ path: shot('card-vest.png') })
  await tap(vest.locator('.pill', { hasText: /^L$/ }).locator('input'))
  await tap(vest.locator('.quick-add-btn'))
  await p.waitForTimeout(500)
  await vest.screenshot({ path: shot('card-vest-added.png') })
  await p.locator('.site-header').screenshot({ path: shot('header-bag.png') })

  // Fullscreen viewer: Hip-Hop tee and a lookbook sheet.
  await tap(p.locator('#shop .product-card', { hasText: 'Rose Panel Shirt' }).locator('.photo-open'))
  await p.waitForTimeout(1200)
  await p.screenshot({ path: shot('lightbox-shirt.png') })
  await p.keyboard.press('Escape')
  await tap(p.locator('.lookbook-card .photo-open').nth(1))
  await p.waitForTimeout(1200)
  await p.screenshot({ path: shot('lightbox-lookbook.png') })
  await p.keyboard.press('Escape')

  // Customiser: Navy with front, back and sleeve prints.
  await p.goto(`${BASE}/product.html?garment=classic-tee&design=design-051`, { waitUntil: 'networkidle' })
  await tap(p.locator('label.swatch-pill', { hasText: 'Navy' }).locator('input'))
  await tap(p.locator('.zone-tab', { hasText: 'Back' }).locator('input'))
  await tap(p.locator('.artwork-option', { hasText: 'Built Different' }).locator('input'))
  await p.waitForTimeout(400)
  await tap(p.locator('.zone-tab', { hasText: 'Right sleeve' }).locator('input'))
  await tap(p.locator('.artwork-option', { hasText: 'IS Crest' }).locator('input'))
  await p.waitForTimeout(400)
  await tap(p.locator('.zone-tab', { hasText: 'Front' }).locator('input'))
  await p.waitForTimeout(1500)
  await p.locator('.studio-options').evaluate((el) => { el.scrollTop = el.querySelector('.zone-picker').offsetTop - 10 })
  await p.waitForTimeout(500)
  await p.screenshot({ path: shot('studio-front.png') })
  await p.locator('.zoom-stage').screenshot({ path: shot('stage-front.png') })
  await tap(p.locator('.look-thumb', { hasText: 'Back' }))
  await p.waitForTimeout(1200)
  await p.locator('.zoom-stage').screenshot({ path: shot('stage-back.png') })
  await tap(p.locator('.look-thumb', { hasText: 'Close-up' }))
  await p.waitForTimeout(1200)
  await p.locator('.zoom-stage').screenshot({ path: shot('stage-closeup.png') })
  await tap(p.locator('.look-thumb', { hasText: 'Front' }))
  await p.waitForTimeout(800)

  // Colour sweep with the same build.
  const colours = ['Black', 'White', 'Navy', 'Charcoal', 'Sand', 'Olive', 'Pink', 'Light blue']
  for (const name of colours) {
    await tap(p.locator('label.swatch-pill', { hasText: name }).locator('input'))
    await p.waitForTimeout(1100)
    await p.locator('.zoom-stage').screenshot({ path: shot(`colour-${name.toLowerCase().replace(' ', '-')}.png`) })
  }

  // 3D spin frames.
  await tap(p.locator('label.swatch-pill', { hasText: 'Black' }).locator('input'))
  await p.waitForTimeout(600)
  await tap(p.locator('.chip', { hasText: '3D view' }))
  await p.waitForSelector('.tee3d-host[data-state="ready"]', { timeout: 20000 })
  await p.waitForTimeout(1500)
  const host = p.locator('.tee3d-host')
  for (let i = 0; i < 36; i++) {
    await host.screenshot({ path: shot(`spin-${String(i).padStart(2, '0')}.png`) })
    await p.waitForTimeout(140)
  }

  // Bag.
  await p.goto(`${BASE}/cart.html`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  await p.screenshot({ path: shot('cart.png') })

  // Phone views.
  const phone = await browser.newContext({ ...devices['iPhone 13'] })
  const m = await phone.newPage()
  await m.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' })
  await m.waitForTimeout(1200)
  await m.screenshot({ path: shot('phone-home.png') })
  await m.goto(`${BASE}/product.html?garment=classic-tee&design=design-061`, { waitUntil: 'networkidle' })
  await tap(m.locator('label.swatch-pill', { hasText: 'Sand' }).locator('input'))
  await m.waitForTimeout(1500)
  await m.screenshot({ path: shot('phone-studio.png') })
  await m.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' })
  await tap(m.locator('#shop .product-card', { hasText: 'Birthday Queen Tee' }).locator('.photo-open'))
  await m.waitForTimeout(1500)
  await m.screenshot({ path: shot('phone-lightbox.png') })

  await browser.close()
  console.log('done')
})()
