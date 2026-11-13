import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

export const assetsDir = path.resolve('assets')

export function walkSourceFiles(entry, files = []) {
  if (!existsSync(entry)) return files
  const stats = statSync(entry)
  if (stats.isDirectory()) {
    for (const name of readdirSync(entry)) walkSourceFiles(path.join(entry, name), files)
    return files
  }
  if (/\.(js|jsx|css|html)$/i.test(entry)) files.push(entry)
  return files
}

export function resolveAsset(relative) {
  const filePath = path.resolve(assetsDir, relative)
  const fromRoot = path.relative(assetsDir, filePath)
  if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) return null
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null
  return { relative: fromRoot.split(path.sep).join('/'), filePath }
}

export function referencedAssets() {
  const files = [
    ...walkSourceFiles('src'),
    ...['index.html', 'product.html', 'cart.html'].flatMap((file) => walkSourceFiles(file))
  ]
  const resolved = new Map()
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(/assets\/[^"'`]+/g)) {
      const raw = match[0].slice('assets/'.length).split('?')[0]
      const candidates = [raw]
      try {
        const decoded = decodeURIComponent(raw)
        if (decoded !== raw) candidates.push(decoded)
      } catch {
        /* The path is not percent-encoded. */
      }
      const found = candidates.map(resolveAsset).find(Boolean)
      if (!found) throw new Error(`Referenced asset is missing: assets/${raw} (${file})`)
      resolved.set(found.relative, found.filePath)
    }
  }
  return resolved
}
