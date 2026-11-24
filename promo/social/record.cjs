/* Records the InterSacks website as a phone screen (1080×1920, 9:16) for social media.
   Usage: node record.cjs <built-site-folder> <out-dir>
   The site folder must be a build that only contains original or owned artwork.
   Output: <out-dir>/raw.mp4 (no text, no sound) and <out-dir>/scenes.json (scene start times). */
const { chromium } = require('playwright')
const { spawnSync } = require('child_process')
const http = require('http')
const fs = require('fs')
const path = require('path')

const SITE = path.resolve(process.argv[2] || 'site')
const OUT = path.resolve(process.argv[3] || 'out')
const FRAMES = path.join(OUT, 'frames')
fs.rmSync(FRAMES, { recursive: true, force: true })
fs.mkdirSync(FRAMES, { recursive: true })

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.avif': 'image/avif', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.json': 'application/json', '.svg': 'image/svg+xml' }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0])
  if (p === '/') p = '/index.html'
  const f = path.join(SITE, p)
  if (!f.startsWith(SITE) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.statusCode = 404; return res.end() }
  res.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream')
  res.end(fs.readFileSync(f))
})

/* Visible finger tap + touch so viewers can follow along. */
const TOUCH_CSS = `
  .reel-tap { position: fixed; z-index: 99999; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%;
    background: rgba(255,255,255,.55); box-shadow: 0 0 0 3px rgba(10,63,145,.7); pointer-events: none;
    animation: reel-tap 520ms ease-out forwards; }
  @keyframes reel-tap { from { transform: scale(.4); opacity: 1 } to { transform: scale(1.5); opacity: 0 } }
  html { scroll-behavior: auto !important; }
  /* Owner rule: the 3D model stays out of marketing, so its toggle is hidden on camera. */
  .view-mode { display: none !important; }
`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  await new Promise((r) => server.listen(4195, r))
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 405, height: 720 },
    deviceScaleFactor: 1080 / 405,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  })
  await context.addInitScript((css) => {
    try { if (!sessionStorage.getItem('reel-started')) { sessionStorage.setItem('reel-started', '1'); localStorage.removeItem('intersacks-cart') } } catch {}
    addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s) })
  }, TOUCH_CSS)
  const page = await context.newPage()
  const base = 'http://localhost:4195/'

  // Screencast: frames arrive only when the screen changes; timestamps let us rebuild a constant frame rate.
  const cdp = await context.newCDPSession(page)
  const frames = []
  let recording = false
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    if (recording) {
      const file = path.join(FRAMES, `f${String(frames.length).padStart(5, '0')}.jpg`)
      fs.writeFileSync(file, Buffer.from(data, 'base64'))
      // Arrival time on the same clock as the scene marks, so captions line up.
      frames.push({ file, t: Date.now() / 1000 - t0 })
    }
    try { await cdp.send('Page.screencastFrameAck', { sessionId }) } catch {}
  })

  const scenes = []
  let t0 = 0
  const mark = (name) => { scenes.push({ name, t: Date.now() / 1000 - t0 }); console.log('scene', name, scenes.at(-1).t.toFixed(2)) }

  /* Bring the target into the part of the screen that isn't covered by the sticky tee preview or buy bar. */
  async function bring(locator, ms = 280) {
    await locator.evaluate(async (el, ms) => {
      const stage = document.querySelector('.studio-stage')
      const buy = document.querySelector('.studio-buy')
      const top = stage && getComputedStyle(stage).position === 'sticky' ? stage.getBoundingClientRect().bottom : 70
      const bottom = buy ? Math.min(innerHeight, buy.getBoundingClientRect().top) : innerHeight
      const r = el.getBoundingClientRect()
      const want = (top + bottom) / 2
      const delta = r.top + r.height / 2 - want
      if (Math.abs(delta) < 6 && r.top >= top && r.bottom <= bottom) return
      const from = scrollY
      const start = performance.now()
      await new Promise((done) => {
        const step = (now) => {
          const k = Math.min(1, (now - start) / ms)
          scrollTo(0, from + delta * (1 - Math.pow(1 - k, 3)))
          if (k < 1) requestAnimationFrame(step); else done()
        }
        requestAnimationFrame(step)
      })
    }, ms)
  }

  async function tap(locator) {
    await bring(locator)
    const box = await locator.boundingBox()
    if (!box) throw new Error('nothing to tap')
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    await page.evaluate(({ x, y }) => {
      const dot = document.createElement('div')
      dot.className = 'reel-tap'
      dot.style.left = `${x}px`; dot.style.top = `${y}px`
      document.body.appendChild(dot)
      setTimeout(() => dot.remove(), 600)
    }, { x, y })
    await sleep(140)
    await page.touchscreen.tap(x, y)
    await sleep(260)
  }

  /* Eased scroll so it reads like a thumb swipe. target: y position, or a selector to bring to `offset` px from the top. */
  async function glide(target, ms = 900, offset = 70) {
    await page.evaluate(async ({ target, ms, offset }) => {
      const el = typeof target === 'string' ? document.querySelector(target) : null
      const to = el ? scrollY + el.getBoundingClientRect().top - offset : target
      const from = scrollY
      const start = performance.now()
      await new Promise((done) => {
        const step = (now) => {
          const k = Math.min(1, (now - start) / ms)
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
          scrollTo(0, from + (to - from) * e)
          if (k < 1) requestAnimationFrame(step); else done()
        }
        requestAnimationFrame(step)
      })
    }, { target, ms, offset })
  }

  async function open(url) {
    await page.goto(base + url, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await sleep(500)
  }

  // Warm the image cache so nothing pops in on camera.
  for (const url of ['index.html', 'product.html?garment=classic-tee&colour=Navy&front=D051c', 'cart.html']) await open(url)

  await open('index.html')
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 })
  recording = true
  t0 = Date.now() / 1000

  // 1. Hero
  mark('hero')
  await sleep(1400)
  await glide(260, 1800)
  await sleep(500)

  // 2. Festive Summer drop
  mark('festive')
  await glide('#festive-summer', 1100, 40)
  await sleep(900)
  await glide('#festive-summer .season-grid', 900, 140)
  await sleep(500)
  await tap(page.locator('#festive-summer [role="tab"]', { hasText: 'Festive' }))
  await glide('#festive-summer .season-head', 500, 40)
  await sleep(500)
  await glide('#festive-summer .season-grid', 1000, 120)
  await sleep(900)

  // 3. Customiser
  mark('design')
  await open('product.html?garment=classic-tee&colour=Navy&front=D051c')
  await sleep(700)
  const swatch = (name) => page.locator('label.swatch-pill', { hasText: name })
  await tap(swatch('Sand'))
  await sleep(550)
  await tap(swatch('Black'))
  await sleep(550)
  await tap(page.locator('.zone-tab', { hasText: 'Back' }))
  await sleep(350)
  await tap(page.locator('.artwork-option', { hasText: 'Built Different' }))
  await sleep(1200)

  // 4. Family Kit
  mark('family')
  await tap(page.locator('.family-kit-toggle'))
  await sleep(300)
  const plus = (label) => page.locator(`.family-kit button[aria-label="${label}"]`)
  for (const l of ['One more adults L', 'One more adults M', 'One more kids 4-5', 'One more kids 8-9']) { await tap(plus(l)); await sleep(120) }
  await bring(page.locator('.family-kit .kit-summary').nth(1), 350)
  await sleep(1100)
  await tap(page.locator('.family-kit .btn-buy'))
  await sleep(700)
  console.log('kit:', (await page.locator('.family-kit .kit-summary').last().innerText()))
  console.log('bag in storage:', await page.evaluate(() => (JSON.parse(localStorage.getItem('intersacks-cart') || '[]')).length))

  // 5. Bag + deposit
  mark('bag')
  await open('cart.html')
  await sleep(600)
  await glide('.cart-summary', 1100, 120)
  await sleep(900)
  await glide('.payment-choice', 800, 260)
  await page.locator('#order-name').fill('Thandi')
  await page.locator('#order-area').fill('Durban')
  await sleep(300)
  await tap(page.locator('.payment-option', { hasText: 'Pay 50% deposit' }))
  await sleep(1600)
  mark('end')

  recording = false
  await cdp.send('Page.stopScreencast')
  await browser.close()
  server.close()

  // Constant 30 fps: for every output frame, show the latest captured frame at that moment.
  const end = scenes.at(-1).t
  const SEQ = path.join(OUT, 'seq')
  fs.rmSync(SEQ, { recursive: true, force: true })
  fs.mkdirSync(SEQ)
  let j = 0
  const total = Math.round(end * 30)
  for (let n = 0; n < total; n++) {
    const t = n / 30
    while (j + 1 < frames.length && frames[j + 1].t <= t) j++
    fs.linkSync(frames[j].file, path.join(SEQ, `s${String(n).padStart(5, '0')}.jpg`))
  }
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', path.join(SEQ, 's%05d.jpg'),
    '-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-r', '30', '-movflags', '+faststart',
    path.join(OUT, 'raw.mp4')], { stdio: 'inherit' })
  if (ff.status !== 0) process.exit(1)
  fs.writeFileSync(path.join(OUT, 'scenes.json'), JSON.stringify(scenes, null, 2))
  console.log('frames', frames.length, '→', path.join(OUT, 'raw.mp4'))
})()
