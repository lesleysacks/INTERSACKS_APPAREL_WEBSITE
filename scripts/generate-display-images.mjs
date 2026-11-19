import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { getPurchasableGarments } from '../src/data/catalogue.js'
import { imageLayouts } from '../src/lib/imageLayouts.js'
import { referencedAssets } from './referenced-assets.mjs'

const PROFILE = 'v1'
const STANDARD_WIDTHS = [320, 480, 640, 960, 1280, 1600]
const SMALL_WIDTHS = [88, 176]
const displayRoot = path.resolve('generated/display')
const manifestPath = path.resolve('generated/display-manifest.json')
const stampPath = path.resolve('generated/display-stamp.json')
const preloadPath = path.resolve('generated/preload.json')
const reportPath = path.resolve('generated/display-report.json')

sharp.concurrency(2)

function widthsFor(sourceWidth, small) {
  const buckets = small ? [...SMALL_WIDTHS, ...STANDARD_WIDTHS] : STANDARD_WIDTHS
  const selected = buckets.filter((width) => width < sourceWidth && width <= 1600)
  if (sourceWidth <= 1600) selected.push(sourceWidth)
  else if (!selected.includes(1600)) selected.push(1600)
  return [...new Set(selected)].sort((left, right) => left - right)
}

function idFor(assetPath) {
  return createHash('sha1').update(assetPath).digest('hex').slice(0, 10)
}

function readJson(filePath) {
  if (!existsSync(filePath)) return {}
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

async function encode(source, width, artwork) {
  const pipeline = sharp(source).rotate().resize({ width, withoutEnlargement: true, fit: 'inside' })
  const [avif, webp] = await Promise.all([
    pipeline.clone().avif({
      quality: artwork ? 54 : 48,
      effort: 4,
      chromaSubsampling: artwork ? '4:4:4' : '4:2:0'
    }).toBuffer(),
    pipeline.clone().webp({
      quality: artwork ? 82 : 76,
      effort: 4,
      alphaQuality: 90,
      smartSubsample: false
    }).toBuffer()
  ])
  return { avif, webp }
}

async function buildOne(assetPath, filePath, previous) {
  const sourceStat = statSync(filePath)
  const stamp = `${PROFILE}:${sourceStat.mtimeMs}:${sourceStat.size}`
  const id = idFor(assetPath)
  const outDir = path.join(displayRoot, id)
  if (previous[assetPath]?.stamp === stamp && existsSync(outDir)) {
    return { cached: true, entry: previous[assetPath].entry, stamp, bytes: previous[assetPath].bytes }
  }

  const meta = await sharp(filePath).rotate().metadata()
  const sourceWidth = meta.width || 0
  const sourceHeight = meta.height || 0
  if (sourceWidth < 32 || sourceHeight < 32) {
    return { cached: false, entry: null, stamp, bytes: { original: sourceStat.size, variants: 0, files: [] } }
  }

  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const artwork = /designs/i.test(assetPath)
  const small = /\/logo\//i.test(assetPath)
  const variants = []
  let variantBytes = 0
  const files = []
  for (const width of widthsFor(sourceWidth, small)) {
    const encoded = await encode(filePath, width, artwork)
    const avifMeta = await sharp(encoded.avif).metadata()
    const actualWidth = avifMeta.width || width
    if (variants.some((variant) => variant.width === actualWidth)) continue
    const avifName = `${actualWidth}.avif`
    const webpName = `${actualWidth}.webp`
    const avifPath = path.join(outDir, avifName)
    const webpPath = path.join(outDir, webpName)
    writeFileSync(avifPath, encoded.avif)
    writeFileSync(webpPath, encoded.webp)
    variants.push({
      width: actualWidth,
      avif: `assets/display/${id}/${avifName}`,
      webp: `assets/display/${id}/${webpName}`
    })
    variantBytes += encoded.avif.length + encoded.webp.length
    files.push({ width: actualWidth, avifBytes: encoded.avif.length, webpBytes: encoded.webp.length })
  }

  return {
    cached: false,
    entry: { width: sourceWidth, height: sourceHeight, variants },
    stamp,
    bytes: { original: sourceStat.size, variants: variantBytes, files }
  }
}

function srcSet(entry) {
  if (!entry?.variants?.length) return ''
  return entry.variants.map((variant) => `${variant.avif} ${variant.width}w`).join(', ')
}

const previous = readJson(stampPath)
const manifest = {}
const stamp = {}
const reportImages = []
let generated = 0
let reused = 0

mkdirSync(path.resolve('generated'), { recursive: true })
mkdirSync(displayRoot, { recursive: true })

const jobs = [...referencedAssets()].filter(([relative]) => /\.(png|jpe?g|webp)$/i.test(relative))
const results = new Array(jobs.length)
let cursor = 0
async function worker() {
  while (cursor < jobs.length) {
    const current = cursor
    cursor += 1
    const [relative, filePath] = jobs[current]
    results[current] = { assetPath: `assets/${relative}`, ...(await buildOne(`assets/${relative}`, filePath, previous)) }
  }
}
await Promise.all([worker(), worker()])

for (const result of results) {
  if (result.entry) manifest[result.assetPath] = result.entry
  stamp[result.assetPath] = { stamp: result.stamp, entry: result.entry, bytes: result.bytes }
  reportImages.push({ src: result.assetPath, cached: result.cached, ...result.bytes })
  if (result.cached) reused += 1
  else generated += 1
}

const keep = new Set(Object.values(manifest).flatMap((entry) => entry.variants.map((variant) => variant.avif.split('/')[2])))
for (const name of existsSync(displayRoot) ? readdirSync(displayRoot) : []) {
  if (!keep.has(name)) rmSync(path.join(displayRoot, name), { recursive: true, force: true })
}

const purchasable = getPurchasableGarments()
/* The home hero opens on the first lookbook sheet (src/data/lookbook.js). */
const hero = { image: 'assets/lookbook/street-moves.jpg' }
const product = purchasable[0]
const preload = {}
if (hero?.image && manifest[hero.image]) {
  preload.home = { src: hero.image, avif: srcSet(manifest[hero.image]), sizes: imageLayouts.hero }
}
if (product?.image && manifest[product.image]) {
  preload.product = { src: product.image, avif: srcSet(manifest[product.image]), sizes: imageLayouts.preview }
}

writeFileSync(manifestPath, JSON.stringify(manifest))
writeFileSync(stampPath, JSON.stringify(stamp))
writeFileSync(preloadPath, JSON.stringify(preload))

const originalBytes = reportImages.reduce((sum, image) => sum + image.original, 0)
const variantBytes = reportImages.reduce((sum, image) => sum + image.variants, 0)
writeFileSync(reportPath, JSON.stringify({
  generated,
  reused,
  imageCount: reportImages.length,
  originalBytes,
  variantBytes,
  images: reportImages
}, null, 2))

console.log(`Display images: ${generated} generated, ${reused} reused, originals ${(originalBytes / 1048576).toFixed(2)} MB, variants ${(variantBytes / 1048576).toFixed(2)} MB`)
