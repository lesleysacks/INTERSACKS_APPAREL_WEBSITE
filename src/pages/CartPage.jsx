import { useState } from 'react'
import { Layout } from '../components/Chrome.jsx'
import { Photo } from '../components/Photo.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice, getGarmentById, placementLabel } from '../data/catalogue.js'
import { TeeMock } from '../components/TeeMock.jsx'
import { createOrderReference, whatsAppOrderUrl } from '../services/orders.js'

export function CartPage() {
  const { items, subtotal, empty, updateQuantity, removeItem, clear, cart } = useCart()
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [area, setArea] = useState('')

  function changeQuantity(index, value) {
    try {
      updateQuantity(index, Number(value))
      setError('')
    } catch (reason) {
      setError(reason.message)
    }
  }

  function proceed(event) {
    event.preventDefault()
    const url = whatsAppOrderUrl(cart, { name, area, reference: createOrderReference() })
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Layout current="cart">
      <section className="band" aria-labelledby="cart-title">
        <div className="wrap">
          <p className="kicker">Cart</p>
          <h1 id="cart-title">Your bag</h1>
          <p className="lede">Review the pieces, then send the order on WhatsApp. Nothing is charged on this website.</p>
          {empty ? (
            <div className="empty-bag">
              <p>Your bag is empty.</p>
              <a className="btn" href="index.html#shop">Continue shopping</a>
            </div>
          ) : (
            <div className="cart-layout">
              <ul className="cart-list">
                {items.map((item, index) => (
                  <li key={`${item.garmentId}-${item.colour}-${item.size}-${(item.prints || []).map((print) => `${print.placement}:${print.designId}`).join('|')}`} className="cart-item">
                    <CartThumb item={item} />
                    <div>
                      <h2>{item.garmentName}</h2>
                      <p>Colour: {item.colour}</p>
                      <p>Size: {item.size}</p>
                      {item.prints?.length ? (
                        <ul className="cart-prints">
                          {item.prints.map((print) => (
                            <li key={print.placement}>{placementLabel(print.placement)}: {print.designName}</li>
                          ))}
                        </ul>
                      ) : null}
                      <p>Each {formatPrice(item.unitPrice)}</p>
                      <div className="field qty-field">
                        <label htmlFor={`qty-${index}`}>Quantity for {item.garmentName}</label>
                        <input
                          id={`qty-${index}`}
                          name={`quantity-${index}`}
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="10"
                          value={item.quantity}
                          onChange={(event) => changeQuantity(index, event.target.value)}
                        />
                      </div>
                      <p>Line total {formatPrice(item.unitPrice * item.quantity)}</p>
                      <button type="button" className="text-button" onClick={() => removeItem(index)}>
                        Remove <span className="visually-hidden">{item.garmentName}</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <aside className="cart-summary" aria-labelledby="summary-title">
                <h2 id="summary-title">Order</h2>
                <dl className="price-list">
                  <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>Confirmed on WhatsApp</dd></div>
                  <div><dt>Total</dt><dd>{formatPrice(subtotal)}</dd></div>
                </dl>
                {error ? <p role="alert">{error}</p> : null}
                <form className="checkout-fields" onSubmit={proceed}>
                  <div className="field">
                    <label htmlFor="order-name">Your name</label>
                    <input id="order-name" name="name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="order-area">Delivery area</label>
                    <input id="order-area" name="area" autoComplete="address-level2" placeholder="e.g. Soweto, Johannesburg" required value={area} onChange={(event) => setArea(event.target.value)} />
                  </div>
                  <button type="submit" className="btn">Send order on WhatsApp</button>
                </form>
                <p className="fine-print">This opens WhatsApp with your order written out. We confirm delivery and payment with you there. Nothing is charged on this website.</p>
                <a className="btn btn-ghost" href="index.html#shop">Continue shopping</a>
                {confirmEmpty ? (
                  <div>
                    <p id="empty-warning">This removes every item from the bag on this device.</p>
                    <button type="button" className="text-button" onClick={() => { clear(); setConfirmEmpty(false) }}>Empty bag</button>
                    <button type="button" className="text-button" onClick={() => setConfirmEmpty(false)}>Keep items</button>
                  </div>
                ) : (
                  <button type="button" className="text-button" aria-describedby="empty-hint" onClick={() => setConfirmEmpty(true)}>Empty bag</button>
                )}
                <p id="empty-hint">Use this only if you want to start the bag again.</p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

/* The bag shows the tee as built: front view, with the back too when it carries a print. */
function CartThumb({ item }) {
  const garment = getGarmentById(item.garmentId)
  const colour = garment?.colours.find((entry) => entry.name === item.colour) || garment?.colours[0]
  if (!garment?.customizable || !colour) return <Photo src={colour?.frontImage || garment?.image} alt="" />
  const prints = item.prints || []
  const hasBack = prints.some((print) => print.placement === 'back-center')
  return (
    <div className={`cart-thumb${hasBack ? ' has-back' : ''}`}>
      <TeeMock colour={colour} view="front" prints={prints} layout="thumb" size={480} alt="" />
      {hasBack ? <TeeMock colour={colour} view="back" prints={prints} layout="thumb" size={480} alt="" /> : null}
    </div>
  )
}
