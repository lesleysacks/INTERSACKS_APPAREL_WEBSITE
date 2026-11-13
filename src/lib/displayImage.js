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
