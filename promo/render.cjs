/* Renders video.html to an MP4: steps renderAt(t) frame by frame, pipes JPEG frames to ffmpeg,
   and muxes the synthesised soundtrack from beat.py.
   Usage: node render.cjs out.mp4 [beat.wav]      Stills: node render.cjs --stills 3,12.5,40 */
const { chromium } = require('playwright')
const { spawn } = require('child_process')
const path = require('path')

;(async () => {
  const args = process.argv.slice(2)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => console.error('page error:', e.message))
  await page.goto('file://' + path.join(__dirname, 'video.html'))
  await page.evaluate(() => window.ready)
  const film = page.locator('#film')

  if (args[0] === '--stills') {
    for (const t of args[1].split(',').map(Number)) {
      await page.evaluate((s) => window.renderAt(s), t)
      await film.screenshot({ path: path.join(__dirname, `still-${t}.jpg`), type: 'jpeg', quality: 85 })
    }
    await browser.close()
    return
  }

  const out = args[0] || 'intersacks-promo.mp4'
  const audio = args[1]
  const { DURATION, FPS } = await page.evaluate(() => ({ DURATION: window.DURATION, FPS: window.FPS }))
  const total = Math.round(DURATION * FPS)
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...(audio ? ['-i', audio] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    ...(audio ? ['-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
    out
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  const started = Date.now()
  for (let f = 0; f < total; f++) {
    await page.evaluate((s) => window.renderAt(s), f / FPS)
    const buf = await film.screenshot({ type: 'jpeg', quality: 93 })
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
    if (f % 150 === 0) console.log(`frame ${f}/${total} (${((Date.now() - started) / 1000).toFixed(0)}s)`)
  }
  ff.stdin.end()
  await new Promise((r) => ff.on('close', r))
  await browser.close()
  console.log('wrote', out)
})()
