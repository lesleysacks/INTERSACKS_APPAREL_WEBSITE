import { formatPrice } from '../data/catalogue.js'
import { Photo } from './Photo.jsx'

export function ProductCard({ garment }) {
  const colours = garment.colours.map((colour) => colour.name).join(', ')
  const href = `product.html?garment=${encodeURIComponent(garment.id)}`

  return (
    <article className="product-card">
      <a className="product-link" href={href}>
        <Photo src={garment.image} alt="" />
        <p className="kicker">{garment.category}</p>
        <h3>{garment.name}</h3>
      </a>
      <p className="price">{formatPrice(garment.basePrice)}</p>
      <p>{colours}</p>
      <p>Sizes {garment.sizes.join(', ')}</p>
      {garment.customizable ? <p className="availability">Add your own design</p> : null}
    </article>
  )
}
