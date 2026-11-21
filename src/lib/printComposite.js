/* Bakes print artwork onto a transparent square canvas the size of the tee photo,
   then folds the tee's own shading into the ink so the art follows the fabric
   (creases darken it, highlights lift it) instead of floating on top.
   Placement styles are the same percentages the CSS layers used. */

const cache = new Map()

export function loadImage(src) {
  if (!src) return Promise.resolve(null)
  if (!cache.has(src)) {
    cache.set(src, new Promise((resolve) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => resolve(image)
      image.onerror = () => {
        cache.delete(src)
        resolve(null)
      }
      image.src = src
    }))
  }
  return cache.get(src)
}

const pct = (value) => parseFloat(value) / 100

/* Draw one print at its placement on a square context of side `size`. */
export function drawPrint(ctx, image, styles, size) {
  const width = pct(styles.width) * size
  const height = width * (image.naturalHeight / image.naturalWidth)
  const centreX = pct(styles.left) * size
  const top = pct(styles.top) * size
  const rotate = /rotate\((-?[\d.]+)deg\)/.exec(styles.transform || '')
  ctx.save()
  ctx.translate(centreX, top + height / 2)
  if (rotate) ctx.rotate((parseFloat(rotate[1]) * Math.PI) / 180)
  ctx.drawImage(image, -width / 2, -height / 2, width, height)
  ctx.restore()
}

/* prints: [{ src, styles }]. Returns a canvas, or null when nothing loaded. */
export async function composePrints(canvas, { prints, shadeSrc, size, strength = 1 }) {
  const [shade, ...images] = await Promise.all([loadImage(shadeSrc), ...prints.map((print) => loadImage(print.src))])
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  prints.forEach((print, index) => {
    if (images[index]) drawPrint(ctx, images[index], print.styles, size)
  })
  if (!shade) return canvas
  // Blend the fold map into the ink, then trim it back to the ink's own shape.
  const ink = document.createElement('canvas')
  ink.width = ink.height = size
  ink.getContext('2d').drawImage(canvas, 0, 0)
  ctx.globalCompositeOperation = 'soft-light'
  ctx.globalAlpha = strength
  ctx.drawImage(shade, 0, 0, size, size)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(ink, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  return canvas
}
