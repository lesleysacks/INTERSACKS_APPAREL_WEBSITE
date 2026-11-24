/* Renders the reel's captions and end card as 1080×1920 PNGs in the site's fonts and colours.
   Captions are transparent full-frame overlays (top safe zone, clear of app UI); the end card is opaque.
   Usage: node captions.cjs <out-dir> */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = path.resolve(process.argv[2] || 'out', 'captions')
fs.mkdirSync(OUT, { recursive: true })
const PROMO = path.resolve(__dirname, '..')

// One caption per scene in record.cjs (same order as scenes.json).
const CAPTIONS = [
  { scene: 'hero', title: 'BUILT DIFFERENT.', sub: 'Original South African streetwear' },
  { scene: 'festive', title: 'FESTIVE SUMMER DROP', sub: 'Drops 1 December' },
  { scene: 'design', title: 'DESIGN YOUR OWN TEE', sub: '8 colours · front, back & sleeves' },
  { scene: 'family', title: 'FAMILY KIT', sub: '4+ matching tees 10% off' },
  { scene: 'bag', title: 'PAY 50% TO LOCK IT IN', sub: 'Or pay in full · order on WhatsApp' }
]
const SITE_URL = 'lesleysacks.github.io/INTERSACKS_APPAREL_WEBSITE'
const HANDLE = '@intersacks.apparel'

const page = (body, transparent) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${PROMO}/fonts/faces.css">
<style>
  html, body { margin: 0; width: 1080px; height: 1920px; background: ${transparent ? 'transparent' : '#0b0b0c'}; overflow: hidden; }
  .cap { position: absolute; left: 70px; right: 70px; top: 250px; display: grid; justify-items: center; gap: 14px; text-align: center; }
  .title { padding: 18px 40px 10px; border-radius: 22px; background: #0b0b0c; color: #f4f1eb;
    font: 400 104px/0.95 'Bebas Neue', Impact, sans-serif; letter-spacing: 0.02em; box-shadow: 0 18px 50px rgba(0,0,0,.35); }
  .title b { color: #2f6bff; font-weight: 400; }
  .sub { padding: 12px 28px; border-radius: 999px; background: #2f6bff; color: #fff;
    font: 700 40px/1.1 'Syne', 'Plus Jakarta Sans', sans-serif; }
  .end { position: absolute; inset: 0; display: grid; align-content: center; justify-items: center; gap: 34px; text-align: center; color: #f4f1eb;
    background: radial-gradient(circle at 50% 35%, #16233f 0%, #0b0b0c 62%); font-family: 'Plus Jakarta Sans', sans-serif; }
  .end img { width: 260px; height: 260px; border-radius: 40px; }
  .end h1 { margin: 0; font: 400 190px/0.9 'Bebas Neue', Impact, sans-serif; }
  .end h1 b { display: block; color: #2f6bff; font-weight: 400; }
  .end .cta { padding: 22px 44px; border-radius: 999px; background: #25d366; color: #0b0b0c; font: 700 48px 'Syne', sans-serif; }
  .end .url { font-size: 34px; color: #cfcac0; }
  .end .handle { font: 700 44px 'Syne', sans-serif; color: #2f6bff; }
</style></head><body>${body}</body></html>`

/* Load from a real file so the page may read the local fonts and logo. */
async function show(p, html) {
  const file = path.join(OUT, '_render.html')
  fs.writeFileSync(file, html)
  await p.goto('file://' + file)
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(150)
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

;(async () => {
  const browser = await chromium.launch()
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  for (const [i, c] of CAPTIONS.entries()) {
    const title = esc(c.title).replace(/(\d+%|DROP|OWN TEE|KIT)/, '<b>$1</b>')
    await show(p, page(`<div class="cap"><div class="title">${title}</div><div class="sub">${esc(c.sub)}</div></div>`, true))
    await p.evaluate(() => document.fonts.ready)
    await p.screenshot({ path: path.join(OUT, `${i + 1}-${c.scene}.png`), omitBackground: true })
  }
  await show(p, page(`<div class="end">
    <img src="file://${PROMO}/shots/logo.png" alt="">
    <h1>BUILT<b>DIFFERENT.</b></h1>
    <div class="cta">Order on WhatsApp</div>
    <div class="url">${SITE_URL}</div>
    <div class="handle">${HANDLE}</div>
  </div>`, false))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(300)
  await p.screenshot({ path: path.join(OUT, 'endcard.png') })
  await browser.close()
  fs.rmSync(path.join(OUT, '_render.html'), { force: true })
  fs.writeFileSync(path.join(OUT, 'captions.json'), JSON.stringify(CAPTIONS, null, 2))
  console.log('captions →', OUT)
})()
