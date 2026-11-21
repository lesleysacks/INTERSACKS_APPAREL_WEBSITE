import { useEffect, useRef, useState } from 'react'
import { getDesignById, getPlacementConfig } from '../data/catalogue.js'
import { TEE_SHADE } from '../data/teeColours.js'
import { composePrints } from '../lib/printComposite.js'
import { Photo } from './Photo.jsx'

/* The printable artwork for a design: the background-free cut-out when there is one. */
export const printSrc = (design) => (design ? design.transparentImage || design.image : null)

/* Prints for one view of the tee, ready for composePrints. */
export function printsForView(prints, view) {
  return prints
    .map((print) => ({ config: getPlacementConfig(print.placement), design: getDesignById(print.designId) }))
    .filter(({ config, design }) => config && design && config.view === view)
    .map(({ config, design }) => ({ src: printSrc(design), styles: config.styles, key: `${config.zone}:${design.id}:${config.name}` }))
}

/* A canvas over the tee photo holding every print for this view, shaded by the fabric. */
export function PrintLayer({ prints, view, size = 1200, className = 'print-layer' }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)
  const list = printsForView(prints, view)
  const signature = list.map((entry) => entry.key).join('|')
  useEffect(() => {
    let cancelled = false
    const target = ref.current
    if (!target) return undefined
    const scratch = document.createElement('canvas')
    composePrints(scratch, { prints: list, shadeSrc: TEE_SHADE[view], size }).then(() => {
      if (cancelled || !ref.current) return
      target.width = target.height = size
      const ctx = target.getContext('2d')
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(scratch, 0, 0)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
    // `signature` captures every print that affects the drawing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, view, size])
  return <canvas ref={ref} className={className} data-ready={ready ? 'true' : 'false'} data-prints={list.length} aria-hidden="true" />
}

/* Tee photo for one view with its prints. Used for the main stage, the lookbook strip and the bag. */
export function TeeMock({ colour, view = 'front', prints = [], layout = 'preview', size = 1200, priority = false, alt, className = '' }) {
  const src = view === 'back' ? colour?.backImage : colour?.frontImage
  return (
    <figure className={`tee-mock ${className}`.trim()} data-view={view}>
      <Photo priority={priority} layout={layout} framed={false} className="tee-mock-photo" src={src || colour?.frontImage} alt={alt} />
      <PrintLayer prints={prints} view={view} size={size} />
    </figure>
  )
}
