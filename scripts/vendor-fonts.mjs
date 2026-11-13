import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const cssUrl = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;600;700&family=Syne:wght@600;700&display=swap'
const fontDir = path.resolve('public/fonts')
const facePath = path.join(fontDir, 'faces.css')
const stampPath = path.join(fontDir, 'source.txt')

if (existsSync(facePath) && existsSync(stampPath) && readFileSync(stampPath, 'utf8') === cssUrl) {
  console.log('Fonts already vendored')
  process.exit(0)
}

const response = await fetch(cssUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  }
})
if (!response.ok) throw new Error(`Font stylesheet request failed: ${response.status}`)
const css = await response.text()
mkdirSync(fontDir, { recursive: true })

let rewritten = ''
const seen = new Map()
for (const block of css.split('@font-face').slice(1)) {
  const family = block.match(/font-family:\s*'([^']+)'/)?.[1]
  const weight = block.match(/font-weight:\s*(\d+)/)?.[1]
  const remote = block.match(/url\(([^)]+)\)/)?.[1]?.replaceAll('"', '')
  const range = block.match(/unicode-range:\s*([^;]+)/)?.[1] || ''
  if (!family || !weight || !remote) continue
  const subset = range.includes('U+0000-00FF') ? 'latin' : 'extra'
  const base = `${family.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-${weight}-${subset}`
  const count = (seen.get(base) || 0) + 1
  seen.set(base, count)
  const fileName = `${base}${count > 1 ? `-${count}` : ''}.woff2`
  const fileResponse = await fetch(remote)
  if (!fileResponse.ok) throw new Error(`Font file request failed: ${remote}`)
  writeFileSync(path.join(fontDir, fileName), Buffer.from(await fileResponse.arrayBuffer()))
  rewritten += `@font-face${block.replace(remote, `./${fileName}`)}`
}

if (!rewritten.includes('font-display')) throw new Error('Vendored font CSS is missing font-display')
writeFileSync(facePath, rewritten)
writeFileSync(stampPath, cssUrl)
console.log('Vendored font faces')
