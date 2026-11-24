import { useState } from 'react'
import { Layout } from '../components/Chrome.jsx'
import { Photo } from '../components/Photo.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatPrice, getDesignById, getGarmentById, placementLabel, STORE_CONFIG } from '../data/catalogue.js'
import { TeeMock } from '../components/TeeMock.jsx'
import { familyGroups, percent } from '../services/family.js'
import { PAYMENT_OPTIONS, PAYMENT_TERMS, paymentSplit } from '../services/payment.js'
import { buildPreviewUrl, createOrderReference, whatsAppOrderUrl } from '../services/orders.js'
import { buildOrderPayload, sendOrderLog } from '../services/orderLog.js'

export function CartPage() {
  const { items, subtotal, discounts, total, empty, updateQuantity, removeItem, clear, cart } = useCart()
  const nudges = familyGroups(items).filter((group) => group.toNext && group.toNext.more <= 2)
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [payment, setPayment] = useState('')

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
    const reference = createOrderReference()
    const url = whatsAppOrderUrl(cart, { name, area, reference, payment })
    if (!url) return
    sendOrderLog(buildOrderPayload(cart, { ref: reference, name, area, payment }))
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
                      {getGarmentById(item.garmentId)?.code ? <p className="code-tag">{getGarmentById(item.garmentId).code}</p> : null}
                      <p>Colour: {item.colour}</p>
                      <p>Size: {item.size}</p>
                      {item.prints?.length ? (
                        <ul className="cart-prints">
                          {item.prints.map((print) => (
                            <li key={print.placement}>{placementLabel(print.placement)}: {print.designName} <span className="code-tag">{getDesignById(print.designId)?.code}</span></li>
                          ))}
                        </ul>
                      ) : null}
                      <p><a className="preview-link" href={buildPreviewUrl(item, '')}>View preview</a></p>
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
                  {discounts.map((group) => (
                    <div key={group.designId} className="discount-row">
                      <dt>Family Kit · {group.designName} × {group.tees} ({percent(group.rate)} off)</dt>
                      <dd>−{formatPrice(group.amount)}</dd>
                    </div>
                  ))}
                  <div><dt>Delivery</dt><dd>Confirmed on WhatsApp</dd></div>
                  <div><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
                </dl>
                {nudges.map((group) => (
                  <p key={group.designId} className="family-nudge">
                    Add {group.toNext.more} more {group.designName} {group.toNext.more === 1 ? 'tee' : 'tees'} (adult or kids) for {percent(group.toNext.rate)} off all of them.
                  </p>
                ))}
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
                  <fieldset className="payment-choice">
                    <legend>How would you like to pay?</legend>
                    {PAYMENT_OPTIONS.map((option) => {
                      const split = paymentSplit(total, option.id)
                      return (
                        <label key={option.id} className="payment-option">
                          <input type="radio" name="payment" value={option.id} required checked={payment === option.id} onChange={() => setPayment(option.id)} />
                          <span>
                            <strong>{option.label}</strong>
                            <span>{option.id === 'deposit' ? `${formatPrice(split.dueNow)} now, ${formatPrice(split.balance)} before dispatch` : `${formatPrice(split.dueNow)} now`}</span>
                          </span>
                        </label>
                      )
                    })}
                    <p className="fine-print">{PAYMENT_TERMS} You pay by EFT or a secure payment link we send on WhatsApp.</p>
                  </fieldset>
                  <button type="submit" className="btn">Send order on WhatsApp</button>
                </form>
                <p className="fine-print">This opens WhatsApp with your order written out. We confirm delivery and payment with you there. Nothing is charged on this website.</p>
                {STORE_CONFIG.orderLogUrl ? <p className="fine-print">We keep a copy of your order (name, area and items) so we can track it.</p> : null}
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
