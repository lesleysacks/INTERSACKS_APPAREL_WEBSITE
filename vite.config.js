import { cpSync, createReadStream, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { referencedAssets, resolveAsset } from './scripts/referenced-assets.mjs'

const types = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml'
}

function displayFile(relative) {
  if (!relative.startsWith('display/')) return null
  const root = path.resolve('generated/display')
  const filePath = path.resolve(root, relative.slice('display/'.length))
  const fromRoot = path.relative(root, filePath)
  if (fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) return null
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null
  return filePath
}

function preloadTag(page) {
  const file = path.resolve('generated/preload.json')
  if (!existsSync(file)) return ''
  const entry = JSON.parse(readFileSync(file, 'utf8'))[page]
  if (!entry?.avif || !entry.sizes) return ''
  return `<link rel="preload" as="image" type="image/avif" fetchpriority="high" imagesrcset="${entry.avif}" imagesizes="${entry.sizes}" />`
}

function serveCatalogueAssets() {
  return {
    name: 'intersacks-assets',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const raw = request.url?.split('?')[0] ?? ''
        if (!raw.startsWith('/assets/')) return next()
        let relative = raw.slice('/assets/'.length)
        try {
          relative = decodeURIComponent(relative)
        } catch {
          return next()
        }
        const filePath = displayFile(relative) || resolveAsset(relative)?.filePath
        if (!filePath) return next()
        const extension = path.extname(filePath).slice(1).toLowerCase()
        response.setHeader('Content-Type', types[extension] || 'application/octet-stream')
        createReadStream(filePath).pipe(response)
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const name = path.basename(ctx.filename || '')
        const page = name === 'index.html' ? 'home' : name === 'product.html' ? 'product' : ''
        if (!page || !html.includes('<!-- lcp-preload -->')) return html
        return html.replace('<!-- lcp-preload -->', preloadTag(page))
      }
    },
    closeBundle() {
      const destRoot = path.resolve('dist/assets')
      for (const [relative, source] of referencedAssets()) {
        const dest = path.resolve(destRoot, relative)
        mkdirSync(path.dirname(dest), { recursive: true })
        cpSync(source, dest)
      }
      const displaySrc = path.resolve('generated/display')
      if (existsSync(displaySrc)) cpSync(displaySrc, path.resolve(destRoot, 'display'), { recursive: true })
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), serveCatalogueAssets()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve('index.html'),
        product: path.resolve('product.html'),
        cart: path.resolve('cart.html'),
        custom: path.resolve('custom.html')
      }
    }
  }
})
