/* Full 360° turn of the 3D tee: drag 10° per frame (OrbitControls: full element height = 2π). */
const { chromium } = require('playwright')
const tap = (loc) => loc.evaluate((el) => el.click())
;(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] })
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage()
  await p.goto('http://localhost:4173/product.html?garment=classic-tee&design=design-051', { waitUntil: 'networkidle' })
  await tap(p.locator('.zone-tab', { hasText: 'Back' }).locator('input'))
  await tap(p.locator('.artwork-option', { hasText: 'Built Different' }).locator('input'))
  await p.waitForTimeout(300)
  await tap(p.locator('.zone-tab', { hasText: 'Left sleeve' }).locator('input'))
  await tap(p.locator('.artwork-option', { hasText: 'IS Crest' }).locator('input'))
  await p.waitForTimeout(300)
  await tap(p.locator('.chip', { hasText: '3D view' }))
  await p.waitForSelector('.tee3d-host[data-state="ready"]', { timeout: 20000 })
  await p.waitForTimeout(800)
  await tap(p.locator('.tee3d-bar .zoom-btn', { hasText: 'Front' }))
  await p.waitForTimeout(1200)
  const host = p.locator('.tee3d-host')
  const box = await host.boundingBox()
  const step = box.height / 36
  const y = box.y + box.height * 0.7
  for (let i = 0; i < 36; i++) {
    await host.screenshot({ path: `shots/spin-${String(i).padStart(2, '0')}.png` })
    const x = box.x + box.width / 2 - step * 8
    await p.mouse.move(x, y)
    await p.mouse.down()
    for (let k = 1; k <= 4; k++) await p.mouse.move(x + (step * k) / 4, y)
    await p.mouse.up()
    await p.waitForTimeout(700)
  }
  console.log('azimuth end', await host.getAttribute('data-azimuth'))
  await b.close()
})()
