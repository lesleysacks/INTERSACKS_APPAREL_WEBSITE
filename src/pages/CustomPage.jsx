import { useState } from 'react'
import { Layout } from '../components/Chrome.jsx'
import { Photo } from '../components/Photo.jsx'
import { getPurchasableGarments } from '../data/catalogue.js'
import { createOrderReference, CUSTOM_OCCASIONS, customEnquiryUrl } from '../services/orders.js'

function initialOccasion() {
  const requested = new URLSearchParams(window.location.search).get('occasion')
  return CUSTOM_OCCASIONS.some((entry) => entry.id === requested) ? requested : 'birthday'
}

export function CustomPage() {
  const garments = getPurchasableGarments()
  const [details, setDetails] = useState({
    occasion: initialOccasion(),
    garment: '',
    quantity: '',
    date: '',
    printText: '',
    notes: '',
    name: ''
  })
  const update = (field) => (event) => setDetails((current) => ({ ...current, [field]: event.target.value }))

  function send(event) {
    event.preventDefault()
    window.open(customEnquiryUrl({ ...details, reference: createOrderReference() }), '_blank', 'noopener,noreferrer')
  }

  return (
    <Layout current="custom">
      <section className="band" aria-labelledby="custom-title">
        <div className="wrap">
          <p className="kicker">Custom orders</p>
          <h1 id="custom-title">Your idea, printed.</h1>
          <p className="lede">Birthdays, teams, matric, events and businesses. Tell us what you need and we send you a quote and a design proof on WhatsApp before anything is printed.</p>

          <ul className="occasion-grid" role="list">
            {CUSTOM_OCCASIONS.map((entry) => (
              <li key={entry.id}>
                <label className="occasion-card">
                  <input
                    type="radio"
                    name="occasion-pick"
                    value={entry.id}
                    checked={details.occasion === entry.id}
                    onChange={update('occasion')}
                  />
                  <strong>{entry.name}</strong>
                  <span>{entry.blurb}</span>
                </label>
              </li>
            ))}
          </ul>

          <div className="custom-layout">
            <form className="custom-form" onSubmit={send} aria-labelledby="custom-form-title">
              <h2 id="custom-form-title">Get a quote</h2>
              <div className="field">
                <label htmlFor="custom-occasion">Occasion</label>
                <select id="custom-occasion" name="occasion" value={details.occasion} onChange={update('occasion')}>
                  {CUSTOM_OCCASIONS.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="custom-garment">Garment</label>
                <select id="custom-garment" name="garment" value={details.garment} onChange={update('garment')}>
                  <option value="">Not sure yet</option>
                  {garments.map((entry) => <option key={entry.id} value={entry.name}>{entry.name}</option>)}
                  <option value="Hoodie">Hoodie</option>
                  <option value="Golf / polo shirt">Golf / polo shirt</option>
                  <option value="Jersey with name and number">Jersey with name and number</option>
                </select>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="custom-quantity">How many?</label>
                  <input id="custom-quantity" name="quantity" type="number" inputMode="numeric" min="1" value={details.quantity} onChange={update('quantity')} />
                </div>
                <div className="field">
                  <label htmlFor="custom-date">Needed by</label>
                  <input id="custom-date" name="date" type="date" value={details.date} onChange={update('date')} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="custom-text">Text or names to print</label>
                <input id="custom-text" name="printText" placeholder="e.g. Birthday Queen · Lerato · 30" value={details.printText} onChange={update('printText')} />
              </div>
              <div className="field">
                <label htmlFor="custom-notes">Anything else?</label>
                <textarea id="custom-notes" name="notes" rows="4" placeholder="Colours, sizes, a design idea, or say you'll send a picture on WhatsApp" value={details.notes} onChange={update('notes')} />
              </div>
              <div className="field">
                <label htmlFor="custom-name">Your name</label>
                <input id="custom-name" name="name" autoComplete="name" required value={details.name} onChange={update('name')} />
              </div>
              <button type="submit" className="btn">Send on WhatsApp</button>
              <p className="fine-print">This opens WhatsApp with your request written out. You can attach photos or a logo there.</p>
            </form>

            <aside className="custom-aside" aria-labelledby="custom-how-title">
              <h2 id="custom-how-title">How it works</h2>
              <ol className="steps steps-compact">
                <li><h3>Send your idea</h3><p>Fill in the form, then add any photos or logos in the WhatsApp chat.</p></li>
                <li><h3>Get a quote and proof</h3><p>We send a price and a mockup of the design for you to approve.</p></li>
                <li><h3>We print it</h3><p>Once you approve, we make your order and arrange delivery or collection.</p></li>
              </ol>
              <p className="fine-print"><strong>Logos and crests:</strong> for a school, club or company logo, we need written permission from the owner of that logo before we can print it.</p>
              <Photo src="assets/products/product-7.png" alt="Birthday Queen Tee, an example of a custom birthday print" />
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  )
}
