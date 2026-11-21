import { useId, useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice } from '../data/catalogue.js'

/* Size (and colour, when there is a choice) plus Add to bag, for ready-made pieces.
   The customer stays where they are; the header bag count updates and a View bag link appears. */
export function QuickAdd({ garment, colourName, onColour, compact = false }) {
  const { addItem } = useCart()
  const id = useId()
  const [size, setSize] = useState('')
  const [status, setStatus] = useState(null)
  const colour = garment.colours.find((entry) => entry.name === colourName) || garment.colours[0]

  function add() {
    if (!size) {
      setStatus({ error: 'Pick a size first.' })
      return
    }
    try {
      addItem({
        garmentId: garment.id,
        garmentName: garment.name,
        colour: colour.name,
        size,
        prints: [],
        designName: 'None',
        unitPrice: garment.basePrice,
        quantity: 1
      })
      setStatus({ added: `${garment.name}, size ${size}` })
    } catch (error) {
      setStatus({ error: error.message })
    }
  }

  return (
    <div className={`quick-add${compact ? ' is-compact' : ''}`}>
      {garment.colours.length > 1 ? (
        <fieldset className="pill-group">
          <legend>Colour <span className="legend-note">{colour.name}</span></legend>
          {garment.colours.map((entry) => (
            <label key={entry.name} className="pill swatch-pill" title={entry.name}>
              <input type="radio" name={`${id}-colour`} checked={entry.name === colour.name} onChange={() => onColour?.(entry.name)} />
              <span className="swatch" style={{ '--swatch': entry.value }} />
              <span>{entry.name}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <fieldset className="pill-group quick-sizes">
        <legend>Size</legend>
        {garment.sizes.map((entry) => (
          <label key={entry} className="pill">
            <input type="radio" name={`${id}-size`} value={entry} checked={size === entry} onChange={() => { setSize(entry); setStatus(null) }} />
            <span>{entry}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" className="btn btn-buy quick-add-btn" onClick={add}>
        {status?.added ? '✓ Added' : <>Add to bag · {formatPrice(garment.basePrice)}</>}
      </button>
      <p className="quick-add-status" aria-live="polite">
        {status?.added ? <>✓ {status.added} is in your bag. <a href="cart.html">View bag</a></> : null}
        {status?.error ? <span className="buy-error">{status.error}</span> : null}
      </p>
    </div>
  )
}
