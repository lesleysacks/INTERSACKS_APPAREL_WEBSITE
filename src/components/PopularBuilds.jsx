import { calculatePrintsPrice, formatPrice, getDesignById, getGarmentById } from '../data/catalogue.js'
import { TeeMock } from './TeeMock.jsx'

/* Ready-to-order looks: original designs already placed on a Classic Tee.
   Each card opens the customiser with that exact build, where size (and kids sizes) are chosen. */
const BUILDS = [
  { designId: 'design-051', colour: 'Black' },
  { designId: 'design-054', colour: 'Navy' },
  { designId: 'design-061', colour: 'White' },
  { designId: 'design-063', colour: 'Black' },
  { designId: 'design-057', colour: 'Light blue' },
  { designId: 'design-005', colour: 'Black' },
  { designId: 'design-059', colour: 'Sand' },
  { designId: 'design-045', colour: 'White' }
]

export function PopularBuilds() {
  const tee = getGarmentById('classic-tee')
  const builds = BUILDS
    .map((entry) => ({ design: getDesignById(entry.designId), colour: tee?.colours.find((c) => c.name === entry.colour) }))
    .filter(({ design, colour }) => design?.active && colour)
  if (!builds.length) return null
  return (
    <div className="popular-builds">
      <h3 className="builds-title">Popular builds <span>Ready to order: pick your size in the customiser</span></h3>
      <ul className="builds-grid" role="list">
        {builds.map(({ design, colour }) => {
          const prints = [{ placement: 'front-center', designId: design.id }]
          return (
            <li key={design.id} className="build-card">
              <a href={`product.html?garment=classic-tee&colour=${encodeURIComponent(colour.name)}&front=${design.code.replace('IS-', '')}c`}>
                <TeeMock colour={colour} view="front" prints={prints} layout="card" size={640} alt={`${design.name} on a ${colour.name.toLowerCase()} Classic Tee`} />
                <span className="build-meta">
                  <strong>{design.name}</strong>
                  <span>{colour.name} Classic Tee · <span className="code-tag">{design.code}</span></span>
                  <span className="build-price">{formatPrice(calculatePrintsPrice('classic-tee', prints))}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
