import { useState } from 'react'
import { formatPrice, garmentViews } from '../data/catalogue.js'
import { Lightbox } from './Lightbox.jsx'
import { Photo } from './Photo.jsx'
import { QuickAdd } from './QuickAdd.jsx'

export function ProductCard({ garment }) {
  const [open, setOpen] = useState(false)
  const [colourName, setColourName] = useState(garment.colours[0]?.name)
  const colour = garment.colours.find((entry) => entry.name === colourName) || garment.colours[0]
  const href = `product.html?garment=${encodeURIComponent(garment.id)}`
  const views = garmentViews(garment, colour)
  const readyMade = !garment.customizable

  return (
    <article className="product-card">
      <button type="button" className="photo-open" onClick={() => setOpen(true)} aria-label={`View ${garment.name} fullscreen`}>
        <Photo src={colour?.frontImage || garment.image} alt="" />
        <span className="photo-open-hint" aria-hidden="true">⤢</span>
      </button>
      <a className="product-link" href={href} data-vt="garment">
        <p className="kicker">{garment.category}</p>
        <h3>{garment.name}</h3>
        {garment.code ? <span className="code-tag">{garment.code}</span> : null}
      </a>
      <p className="price">{formatPrice(garment.basePrice)}</p>
      {readyMade ? (
        <QuickAdd garment={garment} colourName={colourName} onColour={setColourName} compact />
      ) : (
        <>
          <p>{garment.colours.length} colours · Sizes {garment.sizes.join(', ')}</p>
          <p className="availability">Add your own design</p>
          <a className="btn card-customise" href={href}>Customise</a>
        </>
      )}
      <Lightbox open={open} onClose={() => setOpen(false)} title={`${garment.name}${garment.code ? ` (${garment.code})` : ''} · ${formatPrice(garment.basePrice)}`} views={views}>
        {readyMade ? (
          <QuickAdd garment={garment} colourName={colourName} onColour={setColourName} />
        ) : (
          <a className="btn" href={href}>Customise this tee</a>
        )}
      </Lightbox>
    </article>
  )
}
