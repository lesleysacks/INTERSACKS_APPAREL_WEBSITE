import { useRef, useState } from 'react'
import { Layout } from '../components/Chrome.jsx'
import { ArtworkLayer, Photo } from '../components/Photo.jsx'
import { useCart } from '../context/CartContext.jsx'
import {
  formatPrice,
  getCompatibleDesigns,
  getDesignById,
  getGarmentById,
  getPlacementConfig,
  getPlacementsForDesign,
  getPriceBreakdown,
  getPurchasableGarments
} from '../data/catalogue.js'
import { Customizer, initCustomizerFromUrl } from '../services/customizer.js'

export function ProductPage() {
  const customizerRef = useRef(null)
  const [, setVersion] = useState(0)
  const [status, setStatus] = useState('')
  const [quantityError, setQuantityError] = useState('')
  const { addItem, count } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const commit = () => setVersion((version) => version + 1)

  if (!customizerRef.current) {
    const customizer = new Customizer()
    const params = new URLSearchParams(window.location.search)
    initCustomizerFromUrl(customizer, { garment: params.get('garment'), design: params.get('design') })
    customizerRef.current = customizer
  }

  const customizer = customizerRef.current
  const garment = getGarmentById(customizer.selectedGarmentId)
  const colour = garment?.colours.find((entry) => entry.value === customizer.selectedColourValue)
  const design = customizer.selectedDesignId ? getDesignById(customizer.selectedDesignId) : null
  const placement = customizer.selectedPlacement ? getPlacementConfig(customizer.selectedPlacement) : null
  const previewSrc = customizer.viewMode === 'back' ? colour?.backImage : colour?.frontImage
  const breakdown = getPriceBreakdown(customizer.selectedGarmentId, customizer.selectedDesignId)
  const designs = getCompatibleDesigns(customizer.selectedGarmentId)
  const [designQuery, setDesignQuery] = useState('')
  const visibleDesigns = designs.filter((entry) => entry.name.toLowerCase().includes(designQuery.trim().toLowerCase()))

  function selectGarment(garmentId) {
    customizer.setGarment(garmentId)
    setStatus('')
    setJustAdded(false)
    setQuantityError('')
    commit()
  }

  function changeQuantity(value) {
    if (value === '') {
      customizer.quantity = ''
      setQuantityError('Enter a quantity from 1 to 10.')
      commit()
      return
    }
    try {
      customizer.setQuantity(Number(value))
      setQuantityError('')
    } catch (error) {
      customizer.quantity = value
      setQuantityError(error.message)
    }
    commit()
  }

  function addToBag(event) {
    event.preventDefault()
    try {
      if (quantityError || customizer.quantity === '') {
        setQuantityError('Enter a quantity from 1 to 10.')
        return
      }
      const item = customizer.createCartItem()
      addItem(item)
      setStatus(`${item.quantity} × ${item.garmentName} added to your bag.`)
      setJustAdded(true)
    } catch (error) {
      setQuantityError(error.message)
      setStatus('')
      setJustAdded(false)
    }
  }

  return (
    <Layout current="product">
      <section className="band" aria-labelledby="product-title">
        <div className="wrap">
          <p className="kicker">{designs.length ? 'Customise' : garment?.category}</p>
          <h1 id="product-title">{garment ? garment.name : 'Choose a piece'}</h1>
          <p className="lede">{garment?.description} {designs.length ? 'Pick a design from the archive and see it on the garment.' : ''}</p>
          <p className="price product-price">{formatPrice(breakdown.total)}</p>
          <form className="studio-layout" onSubmit={addToBag} aria-labelledby="product-title">
            <div className="preview-panel">
              <figure className="preview-stage">
                <Photo
                  priority
                  layout="preview"
                  className="preview-photo"
                  src={previewSrc || garment?.image}
                  alt={garment ? `${garment.name}, ${customizer.selectedColourName || 'selected colour'}, ${customizer.viewMode}` : 'Selected garment'}
                />
                {design && customizer.viewMode === 'front' && placement ? (
                  <ArtworkLayer
                    src={design.transparentImage || design.image}
                    style={{
                      '--design-width': placement.styles.width,
                      '--design-top': placement.styles.top,
                      '--design-left': placement.styles.left,
                      '--design-transform': placement.styles.transform
                    }}
                  />
                ) : null}
                <figcaption>{customizer.viewMode === 'back' ? 'Back' : 'Front'} · {formatPrice(breakdown.total)} each</figcaption>
              </figure>
              {colour?.backImage ? (
              <fieldset>
                <legend>View</legend>
                <label className="choice">
                  <input type="radio" name="view" value="front" checked={customizer.viewMode === 'front'} onChange={() => { customizer.setViewMode('front'); commit() }} />
                  Front
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    name="view"
                    value="back"
                    checked={customizer.viewMode === 'back'}
                    onChange={() => { customizer.setViewMode('back'); commit() }}
                  />
                  Back
                </label>
              </fieldset>
              ) : null}
            </div>

            <div className="option-panel">
              <div className="field">
                <label htmlFor="garment">Garment</label>
                <select id="garment" name="garment" value={customizer.selectedGarmentId || ''} onChange={(event) => selectGarment(event.target.value)}>
                  {getPurchasableGarments().map((entry) => (
                    <option key={entry.id} value={entry.id}>{entry.name} — {formatPrice(entry.basePrice)}</option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend>Colour</legend>
                {garment?.colours.map((entry) => (
                  <label key={entry.name} className="choice">
                    <input
                      type="radio"
                      name="colour"
                      value={entry.value}
                      checked={customizer.selectedColourValue === entry.value}
                      onChange={() => { customizer.setColour(entry.value, entry.name); commit() }}
                    />
                    <span className="swatch" style={{ '--swatch': entry.value }} />
                    {entry.name}
                  </label>
                ))}
              </fieldset>

              <fieldset>
                <legend>Size</legend>
                {garment?.sizes.map((size) => (
                  <label key={size} className="choice">
                    <input type="radio" name="size" value={size} checked={customizer.selectedSize === size} onChange={() => { customizer.setSize(size); commit() }} />
                    {size}
                  </label>
                ))}
              </fieldset>

              {designs.length ? (
                <>
                  <div className="field">
                    <label htmlFor="artwork-search">Search artwork</label>
                    <input id="artwork-search" name="artwork-search" type="search" value={designQuery} onChange={(event) => setDesignQuery(event.target.value)} />
                  </div>
                  <fieldset className="artwork-picker">
                    <legend>Artwork <span className="legend-note">+{formatPrice(designs[0].additionalPrice)} with a design</span></legend>
                    <div className="artwork-grid">
                      <label className="artwork-option">
                        <input
                          type="radio"
                          name="artwork"
                          value=""
                          checked={!customizer.selectedDesignId}
                          onChange={() => { customizer.clearDesign(); commit() }}
                        />
                        <span className="artwork-plain" aria-hidden="true">Plain</span>
                        <span className="artwork-name">No design</span>
                      </label>
                      {visibleDesigns.map((entry) => (
                        <label key={entry.id} className="artwork-option">
                          <input
                            type="radio"
                            name="artwork"
                            value={entry.id}
                            checked={customizer.selectedDesignId === entry.id}
                            onChange={() => { customizer.setDesign(entry.id); commit() }}
                          />
                          <Photo layout="thumb" framed={false} src={entry.image} alt="" />
                          <span className="artwork-name">{entry.name}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {designQuery && !visibleDesigns.length ? <p>No artwork matches that search.</p> : null}
                  {design ? (
                    <fieldset>
                      <legend>Placement</legend>
                      {getPlacementsForDesign(design.id).map((entry) => (
                        <label key={entry.id} className="choice">
                          <input
                            type="radio"
                            name="placement"
                            value={entry.id}
                            checked={customizer.selectedPlacement === entry.id}
                            onChange={() => { customizer.setPlacement(entry.id); commit() }}
                          />
                          {entry.name}
                        </label>
                      ))}
                    </fieldset>
                  ) : null}
                </>
              ) : null}

              <div className="field">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="10"
                  required
                  value={customizer.quantity}
                  aria-invalid={quantityError ? 'true' : undefined}
                  aria-describedby={quantityError ? 'quantity-error' : 'quantity-hint'}
                  onChange={(event) => changeQuantity(event.target.value)}
                />
                <p id="quantity-hint">Enter a number from 1 to 10.</p>
                {quantityError ? <p id="quantity-error" role="alert">{quantityError}</p> : null}
              </div>

              <dl className="price-list">
                <div><dt>Garment</dt><dd>{formatPrice(breakdown.base)}</dd></div>
                <div><dt>Artwork</dt><dd>{breakdown.artwork ? `+${formatPrice(breakdown.artwork)}` : formatPrice(0)}</dd></div>
                <div><dt>Each</dt><dd>{formatPrice(breakdown.total)}</dd></div>
                <div><dt>Line total</dt><dd>{formatPrice(breakdown.total * (Number(customizer.quantity) || 0))}</dd></div>
              </dl>
              <button className="btn" type="submit">Add to bag · {formatPrice(breakdown.total * (Number(customizer.quantity) || 0))}</button>
              <div className="added-note" aria-live="polite">
                {status ? <p>✓ {status}</p> : null}
                {justAdded ? <a className="btn btn-ghost" href="cart.html">View bag ({count})</a> : null}
              </div>
              <p className="fine-print">Made to order. We confirm sizing and delivery with you on WhatsApp before anything is made.</p>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  )
}
