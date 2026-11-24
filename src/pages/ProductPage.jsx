import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Layout } from '../components/Chrome.jsx'
import { Photo } from '../components/Photo.jsx'
import { printSrc, printsForView, TeeMock } from '../components/TeeMock.jsx'
import { useCart } from '../context/CartContext.jsx'
import {
  formatPrice,
  getCompatibleDesigns,
  getDesignCollections,
  getDesignById,
  getGarmentById,
  getPlacementConfig,
  getPurchasableGarments,
  filterDesigns,
  PRINT_ZONES
} from '../data/catalogue.js'
import { Customizer, initCustomizerFromUrl } from '../services/customizer.js'
import { withPreviewTransition } from '../lib/pageTransitions.js'
import { ZoomStage } from '../components/ZoomStage.jsx'
import { Tee3D } from '../components/Tee3D.jsx'
import { FamilyKit } from '../components/FamilyKit.jsx'

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
    initCustomizerFromUrl(customizer, Object.fromEntries(params))
    customizerRef.current = customizer
  }

  const customizer = customizerRef.current
  const garment = getGarmentById(customizer.selectedGarmentId)
  const colour = garment?.colours.find((entry) => entry.value === customizer.selectedColourValue)
  const prints = customizer.getPrints()
  const printDetails = customizer.getPrintDetails()
  const activeZone = PRINT_ZONES.find((zone) => zone.id === customizer.activeZone) || PRINT_ZONES[0]
  const activePrint = customizer.prints[activeZone.id] || null
  const activeDesign = activePrint ? getDesignById(activePrint.designId) : null
  const view = customizer.viewMode
  const total = customizer.getPrice()
  const base = garment?.basePrice || 0
  const [focus, setFocus] = useState(null)
  const designs = getCompatibleDesigns(customizer.selectedGarmentId)
  const [designQuery, setDesignQuery] = useState('')
  const [designCollection, setDesignCollection] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('collection')
    return getDesignCollections().includes(requested) ? requested : 'All'
  })
  const [mode, setMode] = useState('2d')
  const visibleDesigns = filterDesigns(designs, { collection: designCollection, query: designQuery })
  const onThisView = printDetails.filter((print) => print.view === view)

  function showView(next) {
    setFocus(null)
    commitPreview(() => customizer.setViewMode(next))
  }

  function pickZone(zoneId) {
    setFocus(null)
    commitPreview(() => customizer.setActiveZone(zoneId))
  }

  /* Zoom the stage onto the active print, like the close-up panel on the lookbook sheets. */
  function showDetail() {
    const print = activePrint || prints.find((entry) => getPlacementConfig(entry.placement).view === view) || prints[0]
    if (!print) return
    const config = getPlacementConfig(print.placement)
    commitPreview(() => customizer.setViewMode(config.view))
    const width = parseFloat(config.styles.width) / 100
    setFocus({ key: Date.now(), scale: width < 0.12 ? 3.2 : width < 0.2 ? 2.6 : 1.9, u: parseFloat(config.styles.left) / 100, v: parseFloat(config.styles.top) / 100 + width * 0.5 })
  }

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

  const lineTotal = total * (Number(customizer.quantity) || 0)

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
                front={printsForView(prints, 'front')}
                back={printsForView(prints, 'back')}
                side={view}
                label={`3D ${garment?.name || 'tee'} in ${customizer.selectedColourName || 'the selected colour'}${printDetails.length ? ` with ${printDetails.map((print) => `${print.designName} on the ${print.label.toLowerCase()}`).join(', ')}` : ''}. Drag to rotate.`}
                onUnavailable={() => setMode('2d')}
                onSide={(side) => { customizer.setViewMode(side); commit() }}
              />
            ) : (
            <ZoomStage
              resetKey={`${customizer.selectedGarmentId}-${customizer.selectedColourValue}-${view}`}
              focus={focus}
              label={garment ? `${garment.name}, ${customizer.selectedColourName || 'selected colour'}, ${view}` : 'Selected garment'}
            >
              <TeeMock
                priority
                className="preview-stage"
                colour={colour || { frontImage: garment?.image }}
                view={view}
                prints={prints}
                alt={garment ? `${garment.name}, ${customizer.selectedColourName || 'selected colour'}, ${view}${onThisView.length ? ` with ${onThisView.map((print) => `${print.designName} (${print.label})`).join(', ')}` : ''}` : 'Selected garment'}
              />
            </ZoomStage>
            )}
            <p className="stage-caption">
              <span>{view === 'back' ? 'Back' : 'Front'}</span>
              {onThisView.length ? <span> · {onThisView.map((print) => `${print.designName}, ${print.label}`).join(' · ')}</span> : null}
            </p>
            {colour?.backImage ? (
              <div className="lookbook-strip" role="group" aria-label="Views">
                {['front', 'back'].map((side) => (
                  <button key={side} type="button" className="look-thumb" aria-pressed={view === side && !focus} onClick={() => showView(side)}>
                    <TeeMock colour={colour} view={side} prints={prints} layout="thumb" size={360} alt="" />
                    <span>{side === 'front' ? 'Front' : 'Back'}</span>
                  </button>
                ))}
                <button type="button" className="look-thumb look-detail" aria-pressed={Boolean(focus)} disabled={!prints.length} onClick={showDetail}>
                  {activeDesign || prints.length ? (
                    <Photo layout="thumb" framed={false} src={printSrc(activeDesign || getDesignById(prints[0].designId))} alt="" />
                  ) : <span className="look-empty" aria-hidden="true">+</span>}
                  <span>Close-up</span>
                </button>
              </div>
            ) : null}
          </div>

          <div className="studio-panel">
            <header className="studio-head">
              <p className="kicker">{designs.length ? 'Customise' : garment?.category}</p>
              <h1 id="product-title">{garment ? garment.name : 'Choose a piece'}</h1>
              {garment?.code ? <p className="code-tag">{garment.code}</p> : null}
              <p className="studio-price">{formatPrice(total)} <span>each</span></p>
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
                  <fieldset className="zone-picker">
                    <legend>Print spots <span className="legend-note">add art to as many as you like</span></legend>
                    <div className="zone-tabs">
                      {PRINT_ZONES.map((zone) => {
                        const print = customizer.prints[zone.id]
                        const zoneDesign = print ? getDesignById(print.designId) : null
                        const price = getPlacementConfig(zone.placements[0]).price
                        return (
                          <label key={zone.id} className={`zone-tab${zoneDesign ? ' is-filled' : ''}`}>
                            <input type="radio" name="zone" value={zone.id} checked={activeZone.id === zone.id} onChange={() => pickZone(zone.id)} />
                            <span className="zone-thumb" aria-hidden="true">
                              {zoneDesign ? <Photo layout="thumb" framed={false} src={printSrc(zoneDesign)} alt="" /> : '+'}
                            </span>
                            <span className="zone-text">
                              <span className="zone-name">{zone.name}</span>
                              <small>{zoneDesign ? `✓ ${zoneDesign.name} · ${zoneDesign.code}` : `+${formatPrice(price)}`}</small>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    <div className="zone-active">
                      <p>
                        <strong>{activeZone.name}:</strong> {activeDesign ? <>{activeDesign.name} <span className="code-tag">{activeDesign.code}</span></> : 'pick a design below'}
                      </p>
                      {activeDesign?.note ? <p className="design-note">{activeDesign.note}</p> : null}
                      {activeDesign && activeZone.placements.length > 1 ? (
                        <div className="zone-sizes" role="group" aria-label={`${activeZone.name} print size`}>
                          {activeZone.placements.map((id) => (
                            <button key={id} type="button" className="chip" aria-pressed={activePrint.placement === id} onClick={() => commitPreview(() => customizer.setPlacement(id))}>
                              {id === 'front-small' ? 'Small (chest)' : 'Centre'}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {activeDesign ? (
                        <button type="button" className="chip zone-remove" onClick={() => commitPreview(() => customizer.clearDesign())}>Remove</button>
                      ) : null}
                    </div>
                  </fieldset>
                  <fieldset className="artwork-picker">
                    <legend>Artwork for the {activeZone.name.toLowerCase()} <span className="legend-note">+{formatPrice(getPlacementConfig(activeZone.placements[0]).price)}</span></legend>
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
                          checked={!activeDesign}
                          onChange={() => commitPreview(() => customizer.clearDesign())}
                        />
                        <span className="artwork-plain" aria-hidden="true">Plain</span>
                        <span className="artwork-name">No print here</span>
                      </label>
                      {visibleDesigns.map((entry) => (
                        <label key={entry.id} className="artwork-option">
                          <input
                            type="radio"
                            name="artwork"
                            value={entry.id}
                            checked={activeDesign?.id === entry.id}
                            onChange={() => { setFocus(null); commitPreview(() => { customizer.setDesign(entry.id); customizer.setActiveZone(customizer.activeZone) }) }}
                          />
                          <Photo layout="thumb" framed={false} src={entry.image} alt="" />
                          <span className="artwork-name">{entry.name}</span>
                          <span className="artwork-code">{entry.code}</span>
                        </label>
                      ))}
                    </div>
                    {(designQuery || designCollection !== 'All') && !visibleDesigns.length ? <p>No artwork matches that search.</p> : null}
                  </fieldset>
                  <FamilyKit customizer={customizer} />
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
                Garment {formatPrice(base)}
                {printDetails.map((print) => ` + ${print.label.toLowerCase()} ${formatPrice(print.price)}`).join('')}
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
