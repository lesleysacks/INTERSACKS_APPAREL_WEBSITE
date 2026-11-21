/* Make every Classic Tee colour from one white photo per view, keeping the real folds and shadows.
   Run: node scripts/tint-tees.mjs   (outputs are committed; the build does not run this)
   Source: assets/garments/classic-tee/source/white-{front,back}.png (Canva AI, background removed). */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { TEE_COLOURS } from '../src/data/teeColours.js'

const dir = path.resolve('assets/garments/classic-tee')
const SIZE = 1600
mkdirSync(dir, { recursive: true })

const hex = (value) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16))

for (const view of ['front', 'back']) {
  const { data, info } = await sharp(path.join(dir, 'source', `white-${view}.png`))
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Shading relative to the fabric's average brightness: 1 = flat cloth, <1 shadow, >1 highlight.
  let sum = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 200) {
      sum += (data[i] + data[i + 1] + data[i + 2]) / 3
      count++
    }
  }
  const mean = sum / count

  // Shading map used in the browser to fuse prints into the fabric (grey = no change).
  const shade = Buffer.alloc(data.length)
  for (let i = 0; i < data.length; i += 4) {
    const s = (data[i] + data[i + 1] + data[i + 2]) / 3 / mean
    const v = Math.max(0, Math.min(255, Math.round(128 * s)))
    shade[i] = shade[i + 1] = shade[i + 2] = v
    shade[i + 3] = data[i + 3]
  }
  await sharp(shade, { raw: info }).webp({ quality: 85, alphaQuality: 90 }).toFile(path.join(dir, `shade-${view}.webp`))

  for (const colour of TEE_COLOURS) {
    const [r, g, b] = hex(colour.value)
    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    // Dark fabrics need their folds pushed so they read as cloth, not a flat silhouette.
    const fold = luma < 90 ? 70 : luma < 170 ? 45 : 22
    const out = Buffer.alloc(data.length)
    for (let i = 0; i < data.length; i += 4) {
      const s = (data[i] + data[i + 1] + data[i + 2]) / 3 / mean
      const lift = (s - 1) * fold
      out[i] = Math.max(0, Math.min(255, Math.round(r * Math.min(s, 1.04) + lift)))
      out[i + 1] = Math.max(0, Math.min(255, Math.round(g * Math.min(s, 1.04) + lift)))
      out[i + 2] = Math.max(0, Math.min(255, Math.round(b * Math.min(s, 1.04) + lift)))
      out[i + 3] = data[i + 3]
    }
    await sharp(out, { raw: info }).webp({ quality: 88, alphaQuality: 95 }).toFile(path.join(dir, `${colour.id}-${view}.webp`))
  }
  console.log(`${view}: ${TEE_COLOURS.length} colours + shading map`)
}
