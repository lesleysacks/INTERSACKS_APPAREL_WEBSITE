import { useMemo, useState } from 'react'
import { ProductCard } from '../components/ProductCard.jsx'
import { HeroShowcase } from '../components/HeroShowcase.jsx'
import { Lookbook } from '../components/Lookbook.jsx'
import { SeasonDrop } from '../components/SeasonDrop.jsx'
import { SearchCombobox } from '../components/SearchCombobox.jsx'
import { Photo } from '../components/Photo.jsx'
import { ExternalLink, Layout, visibleWhatsAppNumber, WHATSAPP_DESK_URL } from '../components/Chrome.jsx'
import {
  filterDesigns,
  filterGarments,
  formatPrice,
  getDesignCategories,
  getDesigns,
  getPlannedGarments,
  getMinArtworkPrice,
  getDesignCollections,
  getPurchasableCategories,
  getPurchasableGarments,
  SEASON_COLLECTION,
  sortGarments
} from '../data/catalogue.js'

function initialCollection() {
  const requested = new URLSearchParams(window.location.search).get('collection')
  return getDesignCollections().includes(requested) ? requested : 'All'
}

function initialCategory() {
  const requested = new URLSearchParams(window.location.search).get('category')
  return requested === SEASON_COLLECTION || getPurchasableCategories().includes(requested) ? requested : 'All'
}

const DESIGN_PREVIEW = 12
/* Featured artwork first (newest originals lead), then the rest in catalogue order. */
const ARCHIVE_ORDER = [...getDesigns()].sort((a, b) => Number(b.featured) - Number(a.featured) || (b.image.includes('InterSacks_2026') - a.image.includes('InterSacks_2026')))

export function HomePage() {
  const purchasable = getPurchasableGarments()
  const categories = getPurchasableCategories()
  const featured = purchasable.filter((garment) => garment.featured)
  const collections = categories.map((category) => {
    const items = purchasable.filter((garment) => garment.category === category)
    return { category, count: items.length, lead: items.find((item) => item.featured) || items[0] }
  })
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('featured')
  const [query, setQuery] = useState('')
  const shopItems = sortGarments(filterGarments(purchasable, { category, query }), sort)
  const [designCategory, setDesignCategory] = useState('All')
  const [designCollection, setDesignCollection] = useState(initialCollection)
  const [designQuery, setDesignQuery] = useState('')
  const [showAllDesigns, setShowAllDesigns] = useState(false)
  const designs = useMemo(
    () => filterDesigns(ARCHIVE_ORDER, { category: designCategory, collection: designCollection, query: designQuery }),
    [designCategory, designCollection, designQuery]
  )
  const classic = purchasable.find((garment) => garment.id === 'classic-tee')
  const artworkPrice = getMinArtworkPrice()

  return (
    <Layout current="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker">South African streetwear</p>
          <h1 id="hero-title">Built different.</h1>
          <p className="lede">Heavyweight garments and original artwork from an independent label. Shop the pieces in the catalogue, or start with a plain tee and place a design on it.</p>
          <div className="hero-actions">
            <a className="btn" href="#shop">Shop now</a>
            <a className="btn btn-ghost" href="#lookbook">View lookbook</a>
          </div>
        </div>
        <HeroShowcase />
      </section>

      <Lookbook />

      <SeasonDrop />

      <section id="collections" className="band" aria-labelledby="collections-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">01 — Collections</p>
            <h2 id="collections-title">Shop by silhouette</h2>
          </div>
          <div className="collection-grid">
            {collections.map((collection) => (
              <a key={collection.category} className="collection-tile" href={`index.html?category=${encodeURIComponent(collection.category)}#shop`}>
                <Photo src={collection.lead.image} alt="" />
                <span>
                  <strong>{collection.category}</strong>
                  <span>{collection.count} {collection.count === 1 ? 'piece' : 'pieces'}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {featured.length ? (
      <section className="band" aria-labelledby="featured-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">02 — Featured</p>
            <h2 id="featured-title">Featured pieces</h2>
          </div>
          <div className="product-grid">
            {featured.map((garment) => <ProductCard key={garment.id} garment={garment} />)}
          </div>
        </div>
      </section>
      ) : null}

      <section id="shop" className="band" aria-labelledby="shop-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">03 — Shop</p>
            <h2 id="shop-title">Available to order</h2>
          </div>
          <search aria-labelledby="shop-title" className="shop-search">
            <SearchCombobox value={query} onSearch={setQuery} onCategory={setCategory} />
            <div className="shop-toolbar">
              <div className="collection-chips" role="group" aria-label="Shop categories">
                {['All', SEASON_COLLECTION, ...categories].map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    className={`chip${entry === SEASON_COLLECTION ? ' chip-season' : ''}`}
                    aria-pressed={category === entry}
                    onClick={() => setCategory(entry)}
                  >
                    {entry === 'All' ? 'Everything' : entry}
                  </button>
                ))}
              </div>
              <div className="field sort-field">
                <label htmlFor="shop-sort">Sort</label>
                <select id="shop-sort" name="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price, low to high</option>
                  <option value="price-desc">Price, high to low</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </search>
          <p aria-live="polite" className="result-count">{shopItems.length} {shopItems.length === 1 ? 'piece' : 'pieces'}{query ? ` matching “${query}”` : ''}{category !== 'All' ? ` in ${category}` : ''}</p>
          {shopItems.length ? (
            <div className="product-grid">
              {shopItems.map((garment) => <ProductCard key={garment.id} garment={garment} />)}
            </div>
          ) : <p>No pieces match that search.</p>}
        </div>
      </section>

      <section className="band band-quiet" aria-labelledby="planned-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Coming soon</p>
            <h2 id="planned-title">More silhouettes on the way</h2>
            <p>Hoodies, caps, jackets, accessories and more are in development. Want one early, or need a bulk order for a team, school or event? Message us.</p>
          </div>
          <ul className="planned-list">
            {getPlannedGarments().map((garment) => (
              <li key={garment.id}>{garment.name}</li>
            ))}
          </ul>
          <p><a className="btn btn-ghost" href="custom.html">Plan a custom or bulk order</a></p>
        </div>
      </section>

      {/* Best sellers go here once there is sales data. */}

      <section id="how" className="band" aria-labelledby="how-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Atelier</p>
            <h2 id="how-title">How a custom tee is made</h2>
          </div>
          <ol className="steps">
            <li><h3>Choose the garment</h3><p>Custom artwork is available on the Classic Tee. Every other piece is sold as photographed.</p></li>
            <li><h3>Choose the artwork</h3><p>Pick from the InterSacks archive, or leave the tee plain. Artwork adds from {formatPrice(artworkPrice)}.</p></li>
            <li><h3>Pick the print position</h3><p>Front small or centre (+R50), a big back print (+R80), or a sleeve hit (+R40).</p></li>
            <li><h3>Send the order</h3><p>Review the bag and send it on WhatsApp. The team confirms delivery before the order is made.</p></li>
          </ol>
        </div>
      </section>

      {classic ? (
        <section className="customise-promo" aria-labelledby="customise-promo-title">
          <div className="wrap customise-grid">
            <Photo src={classic.image} alt="" />
            <div>
              <p className="kicker">Customise</p>
              <h2 id="customise-promo-title">Put archive artwork on a Classic Tee.</h2>
              <p>{classic.description} From {formatPrice(classic.basePrice)}, plus from {formatPrice(artworkPrice)} when you add a design on the front, back or sleeve.</p>
              <a className="btn" href="product.html?garment=classic-tee">Start customising</a>
            </div>
          </div>
        </section>
      ) : null}

      <section id="designs" className="band" aria-labelledby="designs-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Artwork</p>
            <h2 id="designs-title">Design archive</h2>
            <p>Every design can go on a Classic Tee from {formatPrice(artworkPrice)} extra. Browse by collection and tap one to try it on.</p>
          </div>
          <div className="collection-chips" role="group" aria-label="Design collections">
            {['All', ...getDesignCollections()].map((entry) => (
              <button
                key={entry}
                type="button"
                className="chip"
                aria-pressed={designCollection === entry}
                onClick={() => setDesignCollection(entry)}
              >
                {entry === 'All' ? 'All designs' : entry}
              </button>
            ))}
          </div>
          <search aria-labelledby="designs-title">
            <form className="filters" onSubmit={(event) => event.preventDefault()}>
              <div className="field">
                <label htmlFor="design-search">Search artwork</label>
                <input id="design-search" name="artwork" type="search" value={designQuery} onChange={(event) => setDesignQuery(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="design-category">Artwork category</label>
                <select id="design-category" name="artwork-category" value={designCategory} onChange={(event) => setDesignCategory(event.target.value)}>
                  <option value="All">All</option>
                  {getDesignCategories().map((entry) => <option key={entry} value={entry}>{entry}</option>)}
                </select>
              </div>
              <button className="btn" type="submit">Search</button>
            </form>
          </search>
          <p aria-live="polite">{designs.length} {designs.length === 1 ? 'design' : 'designs'}</p>
          <div className="product-grid">
            {(showAllDesigns || designQuery || designCategory !== 'All' || designCollection !== 'All' ? designs : designs.slice(0, DESIGN_PREVIEW)).map((design) => (
              <article key={design.id} className="product-card">
                <a className="product-link" href={`product.html?design=${encodeURIComponent(design.id)}`}>
                  <Photo layout="design" src={design.image} alt="" />
                  <p className="kicker">{design.collection}</p>
                  <h3>{design.name}</h3>
                </a>
                <p className="price">from +{formatPrice(artworkPrice)}</p>
              </article>
            ))}
          </div>
          {!showAllDesigns && !designQuery && designCategory === 'All' && designCollection === 'All' && designs.length > DESIGN_PREVIEW ? (
            <p className="more-row">
              <button type="button" className="btn btn-ghost" onClick={() => setShowAllDesigns(true)}>Show all {designs.length} designs</button>
            </p>
          ) : null}
        </div>
      </section>

      <section id="contact" className="band" aria-labelledby="contact-title">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker">Contact</p>
            <h2 id="contact-title">Talk to InterSacks</h2>
            <p>Questions about sizing, bulk orders or a design? We usually reply fastest on WhatsApp.</p>
          </div>
          <div className="contact-grid">
            <a href="mailto:hello@intersacks.co.za"><h3>Email</h3><p>hello@intersacks.co.za</p></a>
            <ExternalLink href={WHATSAPP_DESK_URL}><h3>WhatsApp</h3><p>{visibleWhatsAppNumber()}</p></ExternalLink>
            <ExternalLink href="https://www.instagram.com/intersacks.apparel/"><h3>Instagram</h3><p>@intersacks.apparel</p></ExternalLink>
            <ExternalLink href="https://facebook.com/share/1As4dCE4xn"><h3>Facebook</h3><p>InterSacks Apparel</p></ExternalLink>
          </div>
        </div>
      </section>
    </Layout>
  )
}
