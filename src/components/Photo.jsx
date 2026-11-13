import { useState } from 'react'
import { displayFor } from '../lib/displayImage.js'
import { imageLayouts } from '../lib/imageLayouts.js'

function sourcesFor(src, sizes) {
  const display = src ? displayFor(src) : null
  if (!display) return { display: null, sources: null }
  return {
    display,
    sources: (
      <>
        <source type="image/avif" srcSet={display.avif} sizes={sizes} />
        <source type="image/webp" srcSet={display.webp} sizes={sizes} />
      </>
    )
  }
}

export function Photo({
  src,
  alt,
  priority = false,
  eager = false,
  framed = true,
  layout = 'card',
  className = ''
}) {
  const [failed, setFailed] = useState(false)
  const classes = [framed ? 'photo' : '', className].filter(Boolean).join(' ')
  const sizes = imageLayouts[layout] || imageLayouts.card
  const { display, sources } = sourcesFor(src, sizes)
  const immediate = priority || eager

  if (!src || failed) {
    return <p className={`${classes} photo-fallback`.trim()}>Image coming soon</p>
  }

  return (
    <picture>
      {sources}
      <img
        className={classes || undefined}
        src={src}
        alt={alt}
        width={display?.width || 800}
        height={display?.height || 1000}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        loading={immediate ? 'eager' : 'lazy'}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}

export function ArtworkLayer({ src, style }) {
  const sizes = imageLayouts.artwork
  const { sources } = sourcesFor(src, sizes)
  if (!src) return null
  return (
    <picture>
      {sources}
      <img className="design-layer" src={src} alt="" style={style} decoding="async" />
    </picture>
  )
}
