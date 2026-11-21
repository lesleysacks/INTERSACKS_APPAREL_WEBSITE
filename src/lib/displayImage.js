import manifest from '../../generated/display-manifest.json'

export function displayFor(src) {
  const entry = manifest[src]
  if (!entry?.variants?.length) return null
  const formatSet = (key) => entry.variants.map((variant) => `${variant[key]} ${variant.width}w`).join(', ')
  return {
    avif: formatSet('avif'),
    webp: formatSet('webp'),
    width: entry.width,
    height: entry.height
  }
}

/* A single generated file close to `width` pixels wide, for drawing onto a canvas.
   WebP decodes everywhere canvas does; falls back to the source when no variants exist. */
export function displayFileFor(src, width = 960) {
  const variants = manifest[src]?.variants
  if (!variants?.length) return src
  const pick = variants.find((variant) => variant.width >= width) || variants[variants.length - 1]
  return pick.webp || src
}
