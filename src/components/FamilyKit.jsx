import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { calculatePrintsPrice, formatPrice, getGarmentById } from '../data/catalogue.js'
import { FAMILY_GARMENTS, FAMILY_TIERS, familyDiscountTotal, familyRate, percent } from '../services/family.js'

const GROUPS = [
  { garmentId: 'classic-tee', label: 'Adults' },
  { garmentId: 'kids-classic-tee', label: 'Kids' }
]

/* Family Kit: the tee being built, in several adult and kids sizes at once.
   4+ matching tees get 10% off, 6+ get 15% off (applied in the bag). */
export function FamilyKit({ customizer }) {
  const { addItems } = useCart()
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).get('kit') === '1')
  const [counts, setCounts] = useState({})
  const [status, setStatus] = useState(null)
  const prints = customizer.getPrints()
  const hasFront = prints.some((print) => print.placement === 'front-center' || print.placement === 'front-small')
  if (!FAMILY_GARMENTS.includes(customizer.selectedGarmentId)) return null

  const key = (garmentId, size) => `${garmentId}|${size}`
  const change = (garmentId, size, delta) => {
    setStatus(null)
    setCounts((current) => {
      const next = Math.min(10, Math.max(0, (current[key(garmentId, size)] || 0) + delta))
      return { ...current, [key(garmentId, size)]: next }
    })
  }

  const base = hasFront ? customizer.createCartItem() : null
  const lines = base
    ? GROUPS.flatMap(({ garmentId }) => {
        const garment = getGarmentById(garmentId)
        return garment.sizes
          .filter((size) => counts[key(garmentId, size)] > 0)
          .map((size) => ({
            ...base,
            garmentId,
            garmentName: garment.name,
            size,
            unitPrice: calculatePrintsPrice(garmentId, prints),
            quantity: counts[key(garmentId, size)]
          }))
      })
    : []
  const tees = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  const discount = familyDiscountTotal(lines)
  const rate = familyRate(tees)
  const nextTier = FAMILY_TIERS.slice().reverse().find((tier) => tier.min > tees)

  function addKit() {
    try {
      addItems(lines)
      setStatus({ added: `${tees} matching tees added to your bag.` })
      setCounts({})
    } catch (error) {
      setStatus({ error: error.message })
    }
  }

  return (
    <fieldset className="family-kit">
      <legend>Family Kit <span className="legend-note">4+ matching tees {percent(FAMILY_TIERS[1].rate)} off · 6+ {percent(FAMILY_TIERS[0].rate)} off</span></legend>
      {!open ? (
        <button type="button" className="btn btn-ghost family-kit-toggle" onClick={() => setOpen(true)}>Make it a Family Kit</button>
      ) : !hasFront ? (
        <p className="kit-summary">Pick a front design first, then choose sizes for the whole family.</p>
      ) : (
        <>
          <p className="kit-summary">Same colour and prints for everyone. Choose how many of each size:</p>
          <div className="kit-groups">
            {GROUPS.map(({ garmentId, label }) => {
              const garment = getGarmentById(garmentId)
              return (
                <div key={garmentId} className="kit-group">
                  <h4>{label} · {formatPrice(calculatePrintsPrice(garmentId, prints))} each</h4>
                  <div className="kit-sizes">
                    {garment.sizes.map((size) => {
                      const count = counts[key(garmentId, size)] || 0
                      return (
                        <div key={size} className="kit-size" role="group" aria-label={`${label} size ${size}`}>
                          <span>{size}</span>
                          <button type="button" aria-label={`One fewer ${label.toLowerCase()} ${size}`} onClick={() => change(garmentId, size, -1)} disabled={!count}>−</button>
                          <output aria-live="polite">{count}</output>
                          <button type="button" aria-label={`One more ${label.toLowerCase()} ${size}`} onClick={() => change(garmentId, size, 1)}>+</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="kit-summary" aria-live="polite">
            {tees ? <>{tees} {tees === 1 ? 'tee' : 'tees'} · {formatPrice(subtotal)}</> : 'No sizes chosen yet.'}
            {discount ? <> · <strong>Family Kit {percent(rate)} off: −{formatPrice(discount)} → {formatPrice(subtotal - discount)}</strong></> : null}
            {tees && nextTier ? <> · add {nextTier.min - tees} more for {percent(nextTier.rate)} off</> : null}
          </p>
          <button type="button" className="btn btn-buy" onClick={addKit} disabled={!tees}>
            Add kit to bag{tees ? ` · ${formatPrice(subtotal - discount)}` : ''}
          </button>
          {status?.added ? <p className="kit-summary" role="status">✓ {status.added} <a href="cart.html">View bag</a></p> : null}
          {status?.error ? <p className="buy-error" role="alert">{status.error}</p> : null}
        </>
      )}
    </fieldset>
  )
}
