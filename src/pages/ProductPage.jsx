import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Layout } from '../components/Chrome.jsx'
import { ArtworkLayer, Photo } from '../components/Photo.jsx'
import { useCart } from '../context/CartContext.jsx'
import {
  formatPrice,
  getCompatibleDesigns,
  getDesignCollections,
  getMinArtworkPrice,
  getDesignById,
  getGarmentById,
  getPlacementConfig,
  getPlacementsForDesign,
  getPriceBreakdown,
  getPurchasableGarments
} from '../data/catalogue.js'
import { Customizer, initCustomizerFromUrl } from '../services/customizer.js'
import { withPreviewTransition } from '../lib/pageTransitions.js'
import { ZoomStage } from '../components/ZoomStage.jsx'
import { Tee3D } from '../components/Tee3D.jsx'

export function ProductPage() {
  const customizerRef = useRef(null)
  const [, setVersion] = useState(0)
  const [status, setStatus] = useState('')
  const [quantityError, setQuantityError] = useState('')
  const { addItem, count } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    if (!flash) return undefined
    const timer = setTimeout(() => setFlash(false), 1600)
    return () => clearTimeout(timer)
  }, [flash])
  const commit = () => setVersion((version) => version + 1)
  /* Visual changes to the tee cross-fade where view transitions are supported. */
  const commitPreview = (change) => withPreviewTransition(() => flushSync(() => { change(); commit() }))

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
  const breakdown = getPriceBreakdown(customizer.selectedGarmentId, customizer.selectedDesignId, customizer.selectedPlacement)
  const designs = getCompatibleDesigns(customizer.selectedGarmentId)
  const [designQuery, setDesignQuery] = useState('')
  const [designCollection, setDesignCollection] = useState('All')
  const [mode, setMode] = useState('2d')
  const visibleDesigns = designs.filter((entry) =>
    (designCollection === 'All' || entry.collection === designCollection) &&
    [entry.name, entry.collection].some((value) => value.toLowerCase().includes(designQuery.trim().toLowerCase()))
  )
  const isBackPrint = placement?.view === 'back'

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
      setFlash(true)
    } catch (error) {
      setQuantityError(error.message)
      setStatus('')
      setJustAdded(false)
    }
  }

  const lineTotal = breakdown.total * (Number(customizer.quantity) || 0)
  const viewLabel = isBackPrint ? 'Back print preview' : customizer.viewMode === 'back' ? 'Back' : 'Front'

  return (
    <Layout current="product">
      <section className="studio-band" aria-labelledby="product-title">
        <form className="studio wrap" onSubmit={addToBag} aria-labelledby="product-title">
          <div className="studio-stage">
            {garment?.customizable ? (
            <div className="collection-chips view-mode" role="group" aria-label="Preview mode">
              <button type="button" className="chip" aria-pressed={mode === '2d'} onClick={() => setMode('2d')}>Photo</button>
              <button type="button" className="chip" aria-pressed={mode === '3d'} onClick={() => setMode('3d')}>3D view</button>
            </div>
            ) : null}
            {mode === '3d' && garment?.customizable ? (
              <Tee3D
                colour={customizer.selectedColourValue}
                designSrc={design ? design.transparentImage || design.image : null}
                placement={design ? placement : null}
                label={`3D ${garment?.name || 'tee'} in ${customizer.selectedColourName || 'the selected colour'}${design ? ` with ${design.name} on the ${placement?.name}` : ''}. Drag to rotate.`}
                onUnavailable={() => setMode('2d')}
              />
            ) : (
            <ZoomStage
              resetKey={`${customizer.selectedGarmentId}-${customizer.selectedColourValue}`}
              label={garment ? `${garment.name}, ${customizer.selectedColourName || 'selected colour'}, ${viewLabel.toLowerCase()}` : 'Selected garment'}
            >
              <figure className="preview-stage">
                <Photo
                  priority
                  layout="preview"
                  className="preview-photo"
                  src={previewSrc || garment?.image}
                  alt={garment ? `${garment.name}, ${customizer.selectedColourName || 'selected colour'}, ${customizer.viewMode}` : 'Selected garment'}
                />
                {design && placement ? (
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
              </figure>
            </ZoomStage>
            )}
            <p className="stage-caption">
              <span>{viewLabel}{isBackPrint ? ' (shown on the tee photo)' : ''}</span>
              {design ? <span> · {design.name}, {placement?.name}</span> : null}
            </p>
            {colour?.backImage ? (
              <div className="collection-chips" role="group" aria-label="View">
                {['front', 'back'].map((mode) => (
                  <button key={mode} type="button" className="chip" aria-pressed={customizer.viewMode === mode} onClick={() => { customizer.setViewMode(mode); commit() }}>
                    {mode === 'front' ? 'Front' : 'Back'}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="studio-panel">
            <header className="studio-head">
              <p className="kicker">{designs.length ? 'Customise' : garment?.category}</p>
              <h1 id="product-title">{garment ? garment.name : 'Choose a piece'}</h1>
              <p className="studio-price">{formatPrice(breakdown.total)} <span>each</span></p>
              <p className="studio-desc">{garment?.description}</p>
            </header>

            <div className="studio-options">
              <div className="field">
                <label htmlFor="garment">Garment</label>
                <select id="garment" name="garment" value={customizer.selectedGarmentId || ''} onChange={(event) => selectGarment(event.target.value)}>
                  {getPurchasableGarments().map((entry) => (
                    <option key={entry.id} value={entry.id}>{entry.name} — {formatPrice(entry.basePrice)}</option>
                  ))}
                </select>
              </div>

              <fieldset className="pill-group">
                <legend>Colour <span className="legend-note">{customizer.selectedColourName}</span></legend>
                {garment?.colours.map((entry) => (
                  <label key={entry.name} className="pill swatch-pill" title={entry.name}>
                    <input
                      type="radio"
                      name="colour"
                      value={entry.value}
                      checked={customizer.selectedColourValue === entry.value}
                      onChange={() => commitPreview(() => customizer.setColour(entry.value, entry.name))}
                    />
                    <span className="swatch" style={{ '--swatch': entry.value }} />
                    <span>{entry.name}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="pill-group">
                <legend>Size</legend>
                {garment?.sizes.map((size) => (
                  <label key={size} className="pill">
                    <input type="radio" name="size" value={size} checked={customizer.selectedSize === size} onChange={() => { customizer.setSize(size); commit() }} />
                    <span>{size}</span>
                  </label>
                ))}
              </fieldset>

              {designs.length ? (
                <>
                  <fieldset className="artwork-picker">
                    <legend>Artwork <span className="legend-note">from +{formatPrice(getMinArtworkPrice())}</span></legend>
                    <div className="artwork-filters">
                      <label htmlFor="artwork-search" className="visually-hidden">Search artwork</label>
                      <input id="artwork-search" name="artwork-search" type="search" placeholder="Search designs…" autoComplete="off" value={designQuery} onChange={(event) => setDesignQuery(event.target.value)} />
                      <label htmlFor="artwork-collection" className="visually-hidden">Collection</label>
                      <select id="artwork-collection" name="artwork-collection" value={designCollection} onChange={(event) => setDesignCollection(event.target.value)}>
                        <option value="All">All collections</option>
                        {getDesignCollections().map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                      </select>
                    </div>
                    <div className="artwork-grid">
                      <label className="artwork-option">
                        <input
                          type="radio"
                          name="artwork"
                          value=""
                          checked={!customizer.selectedDesignId}
                          onChange={() => commitPreview(() => customizer.clearDesign())}
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
                            onChange={() => commitPreview(() => customizer.setDesign(entry.id))}
                          />
                          <Photo layout="thumb" framed={false} src={entry.image} alt="" />
                          <span className="artwork-name">{entry.name}</span>
                        </label>
                      ))}
                    </div>
                    {(designQuery || designCollection !== 'All') && !visibleDesigns.length ? <p>No artwork matches that search.</p> : null}
                  </fieldset>
                  {design ? (
                    <fieldset className="pill-group">
                      <legend>Print position</legend>
                      {getPlacementsForDesign(design.id).map((entry) => (
                        <label key={entry.id} className="pill">
                          <input
                            type="radio"
                            name="placement"
                            value={entry.id}
                            checked={customizer.selectedPlacement === entry.id}
                            onChange={() => commitPreview(() => customizer.setPlacement(entry.id))}
                          />
                          <span>{entry.name} <small>+{formatPrice(entry.price)}</small></span>
                        </label>
                      ))}
                    </fieldset>
                  ) : null}
                </>
              ) : <p className="fine-print">Sold as shown. Pick your colour and size.</p>}
              <p className="fine-print">Made to order. We confirm sizing and delivery with you on WhatsApp before anything is made.</p>
            </div>

            <footer className="studio-buy">
              <div className="buy-row">
                <div className="field qty-stepper">
                  <label htmlFor="quantity">Qty</label>
                  <div className="stepper">
                    <button type="button" aria-label="One fewer" onClick={() => changeQuantity(String(Math.max(1, (Number(customizer.quantity) || 1) - 1)))}>−</button>
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
                      aria-describedby={quantityError ? 'quantity-error' : undefined}
                      onChange={(event) => changeQuantity(event.target.value)}
                    />
                    <button type="button" aria-label="One more" onClick={() => changeQuantity(String(Math.min(10, (Number(customizer.quantity) || 0) + 1)))}>+</button>
                  </div>
                </div>
                <button className={`btn btn-buy${flash ? ' is-added' : ''}`} type="submit">
                  {flash ? '✓ Added to bag' : <>Add to bag · {formatPrice(lineTotal)}</>}
                </button>
              </div>
              <p className="buy-breakdown">
                Garment {formatPrice(breakdown.base)}
                {breakdown.artwork ? ` + artwork ${formatPrice(breakdown.artwork)}` : ''}
                {Number(customizer.quantity) > 1 ? ` × ${customizer.quantity}` : ''}
              </p>
              {quantityError ? <p id="quantity-error" role="alert" className="buy-error">{quantityError}</p> : null}
              <div className="added-note" aria-live="polite">
                {status ? <p>✓ {status}</p> : null}
                {justAdded ? <a className="btn btn-ghost" href="cart.html">View bag ({count})</a> : null}
              </div>
            </footer>
          </div>
        </form>
      </section>
    </Layout>
  )
}
