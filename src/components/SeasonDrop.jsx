import { useState } from 'react'
import { calculatePrintsPrice, formatPrice, getDesignById, getGarmentById } from '../data/catalogue.js'
import { dropDateLabel, SEASON_DROP } from '../data/seasonal.js'
import { seasonNotifyUrl } from '../services/orders.js'
import { TeeMock } from './TeeMock.jsx'

/* Homepage "Festive Summer" drop: Summer and Festive tabs, each with Available now and Coming soon. */
export function SeasonDrop() {
  const [tabId, setTabId] = useState(SEASON_DROP.tabs[0].id)
  const tab = SEASON_DROP.tabs.find((entry) => entry.id === tabId)
  const tee = getGarmentById('classic-tee')
  const when = dropDateLabel()
  const available = tab.available
    .map((entry) => ({ ...entry, design: getDesignById(entry.designId), colour: tee?.colours.find((c) => c.name === entry.colour) }))
    .filter((entry) => entry.design?.active && entry.colour)

  return (
    <section id="festive-summer" className="band season-band" data-tab={tab.id} aria-labelledby="season-title">
      <div className="wrap">
        <div className="season-head">
          <div className="section-head">
            <p className="kicker">{SEASON_DROP.kicker} · {when}</p>
            <h2 id="season-title">{SEASON_DROP.title}</h2>
            <p>{SEASON_DROP.blurb}</p>
          </div>
          <div className="collection-chips season-tabs" role="tablist" aria-label="Festive Summer">
            {SEASON_DROP.tabs.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`season-tab-${entry.id}`}
                aria-controls="season-panel"
                aria-selected={entry.id === tab.id}
                className="chip"
                onClick={() => setTabId(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div id="season-panel" role="tabpanel" aria-labelledby={`season-tab-${tab.id}`}>
          <p className="season-intro">{tab.intro}</p>

          {available.length ? (
            <>
              <h3 className="season-sub">Available now</h3>
              <ul className="season-grid" role="list">
                {available.map(({ design, colour }) => {
                  const prints = [{ placement: 'front-center', designId: design.id }]
                  const href = `product.html?garment=classic-tee&colour=${encodeURIComponent(colour.name)}&front=${design.code.replace('IS-', '')}c`
                  return (
                    <li key={design.id} className="season-card">
                      <a href={href}>
                        <TeeMock colour={colour} view="front" prints={prints} layout="card" size={720} alt={`${design.name} on a ${colour.name.toLowerCase()} Classic Tee`} />
                        <span className="season-meta">
                          <strong>{design.name}</strong>
                          <span>{colour.name} Classic Tee · <span className="code-tag">{design.code}</span></span>
                          <span className="season-price">{formatPrice(calculatePrintsPrice('classic-tee', prints))}</span>
                          <span className="season-cta">Customise →</span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : null}

          <h3 className="season-sub">Coming soon</h3>
          <ul className="season-grid" role="list">
            {tab.comingSoon.map((entry) => (
              <li key={entry.id} className="season-card is-soon">
                <div className="season-teaser" aria-hidden="true"><span>{tab.label}</span></div>
                <span className="season-meta">
                  <strong>{entry.name}</strong>
                  <span>{entry.blurb}</span>
                  <span className="season-when">{when}</span>
                  <a className="btn btn-ghost season-notify" href={seasonNotifyUrl(entry.name, tab.label)} target="_blank" rel="noopener noreferrer">
                    Notify me on WhatsApp
                  </a>
                </span>
              </li>
            ))}
          </ul>
          <p className="season-more"><a href="product.html?garment=classic-tee&collection=Festive%20Summer">Browse every Festive Summer design in the customiser →</a></p>
        </div>
      </div>
    </section>
  )
}
