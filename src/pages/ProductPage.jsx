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
  const { addItem } = useCart()
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
      setStatus(`${item.garmentName} added to the bag.`)
    } catch (error) {
      setQuantityError(error.message)
      setStatus('')
    }
  }

  return (
    <Layout current="product">
      <section className="band" aria-labelledby="product-title">
        <div className="wrap">
          <p className="kicker">Customise</p>
          <h1 id="product-title">{garment ? garment.name : 'Choose a piece'}</h1>
          <p className="lede">{garment?.description} {designs.length ? 'Artwork from the archive can be placed on this garment.' : 'This piece is sold as shown.'}</p>
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
                    disabled={!colour?.backImage}
                    onChange={() => { customizer.setViewMode('back'); commit() }}
                  />
                  Back
                </label>
              </fieldset>
              {colour?.backImage ? null : <p id="back-note">Back image not available for this colour.</p>}
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
                  <div className="field">
                    <label htmlFor="artwork">Artwork</label>
                    <select
                      id="artwork"
                      name="artwork"
                      value={customizer.selectedDesignId || ''}
                      onChange={(event) => {
                        if (event.target.value) customizer.setDesign(event.target.value)
                        else customizer.clearDesign()
                        commit()
                      }}
                    >
                      <option value="">Plain garment</option>
                      {visibleDesigns.map((entry) => (
                        <option key={entry.id} value={entry.id}>{entry.name} (+{formatPrice(entry.additionalPrice)})</option>
                      ))}
                    </select>
                  </div>
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
              ) : <p>No archive artwork is available for this garment.</p>}

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
              <p>Available to order. The final order is confirmed on WhatsApp.</p>
              <button className="btn" type="submit">Add to bag</button>
              <p aria-live="polite">{status}</p>
              <a href="cart.html">Go to cart</a>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  )
}
