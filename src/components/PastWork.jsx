import { useState } from 'react'
import { Lightbox } from './Lightbox.jsx'
import { Photo } from './Photo.jsx'
import { getShowcaseDesigns, getShowcaseGarments } from '../data/catalogue.js'

/* Earlier pieces and artwork the owner did not create: shown for inspiration only.
   No prices, no bag, no customise links. They never go in ads or promo videos (CLAUDE.md rule 4). */
const PREVIEW = 8

export function PastWork() {
  const items = [
    ...getShowcaseGarments().map((garment) => ({ id: garment.id, name: garment.name, kind: garment.category, src: garment.image })),
    ...getShowcaseDesigns().map((design) => ({ id: design.id, name: design.name, kind: 'Artwork', src: design.image }))
  ]
  const [showAll, setShowAll] = useState(false)
  const [openId, setOpenId] = useState(null)
  const open = items.find((item) => item.id === openId)
  if (!items.length) return null
  const shown = showAll ? items : items.slice(0, PREVIEW)

  return (
    <section id="past-work" className="band band-quiet past-work" aria-labelledby="past-work-title">
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">Past work</p>
          <h2 id="past-work-title">Earlier pieces</h2>
          <p>Earlier pieces and artwork, shown for inspiration. <strong>Not for sale.</strong> Want something in this spirit? We'll make you an original.</p>
        </div>
        <ul className="past-work-grid">
          {shown.map((item) => (
            <li key={item.id}>
              <button type="button" className="photo-open past-work-open" onClick={() => setOpenId(item.id)} aria-label={`View ${item.name} fullscreen`}>
                <Photo layout="design" src={item.src} alt="" />
                <span className="photo-open-hint" aria-hidden="true">⤢</span>
              </button>
              <span className="past-work-meta">
                <strong>{item.name}</strong>
                <span className="not-for-sale">Not for sale</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="more-row">
          {!showAll && items.length > PREVIEW ? (
            <button type="button" className="btn btn-ghost" onClick={() => setShowAll(true)}>Show all {items.length} past pieces</button>
          ) : null}
          <a className="btn" href="custom.html">Get a custom quote</a>
        </p>
      </div>
      <Lightbox
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={open ? `${open.name} · Past work` : 'Past work'}
        views={open ? [{ label: open.kind, src: open.src, alt: `${open.name}, past work` }] : []}
      >
        <p className="not-for-sale">Past work · not for sale. <a href="custom.html">Ask for something original</a></p>
      </Lightbox>
    </section>
  )
}
