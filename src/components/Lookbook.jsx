import { useRef } from 'react'
import { Photo } from './Photo.jsx'
import { lookbook, lookbookHref } from '../data/lookbook.js'

/* Swipeable lookbook row: native scroll with snap points, plus previous/next buttons. */
export function Lookbook() {
  const trackRef = useRef(null)

  function scrollByCard(direction) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.lookbook-card')
    const step = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    track.scrollBy({ left: direction * step, behavior: smooth ? 'smooth' : 'auto' })
  }

  return (
    <section id="lookbook" className="band lookbook-band" aria-labelledby="lookbook-title">
      <div className="wrap">
        <div className="lookbook-head">
          <div className="section-head">
            <p className="kicker">Lookbook</p>
            <h2 id="lookbook-title">Every angle, every piece</h2>
            <p>Front, back and close-up views. Tap a look to put that artwork on your own Classic Tee.</p>
          </div>
          <div className="lookbook-nav">
            <button type="button" className="btn btn-ghost" onClick={() => scrollByCard(-1)} aria-label="Previous looks">←</button>
            <button type="button" className="btn btn-ghost" onClick={() => scrollByCard(1)} aria-label="Next looks">→</button>
          </div>
        </div>
        <ul className="lookbook-track" ref={trackRef}>
          {lookbook.map((entry) => (
            <li key={entry.id} className="lookbook-card">
              <a href={lookbookHref(entry)}>
                <Photo layout="lookbook" framed={false} src={entry.image} alt={entry.alt} />
                <span className="lookbook-meta">
                  <strong>{entry.name}</strong>
                  <span>{entry.tagline}</span>
                  <span className="lookbook-cta">Put it on a tee →</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
