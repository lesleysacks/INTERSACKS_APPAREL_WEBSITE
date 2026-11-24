import {
  formatPrice,
  getDesignCollections,
  getDesigns,
  getPurchasableCategories,
  getPurchasableGarments
} from './catalogue.js'

/* Where in `text` does `needle` match best?
   rank 0 = starts the text, 1 = starts a word, 2 = anywhere, -1 = no match. */
export function matchText(text, needle) {
  const haystack = String(text || '').toLowerCase()
  const index = haystack.indexOf(needle)
  if (index < 0) return { rank: -1 }
  if (index === 0) return { rank: 0, start: 0, end: needle.length }
  const wordStart = haystack.search(new RegExp(`(^|[^a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`))
  if (wordStart >= 0) {
    const start = haystack[wordStart] === needle[0] && wordStart === 0 ? wordStart : wordStart + 1
    return { rank: 1, start, end: start + needle.length }
  }
  return { rank: 2, start: index, end: index + needle.length }
}

function score(fields, needle) {
  let best = null
  fields.forEach((field, fieldIndex) => {
    const match = matchText(field, needle)
    if (match.rank < 0) return
    // Matches in the label (field 0) beat matches in descriptions.
    const value = match.rank + fieldIndex * 3
    if (!best || value < best.value) best = { value, labelMatch: fieldIndex === 0 ? match : null }
  })
  return best
}

const TYPE_ORDER = { garment: 0, design: 1, collection: 2, category: 3 }

export function getSearchSuggestions(query, limit = 8) {
  const needle = String(query || '').trim().toLowerCase()
  if (!needle) return []
  const results = []

  for (const garment of getPurchasableGarments()) {
    const hit = score([garment.name, garment.category, garment.description, garment.code], needle)
    if (hit) {
      results.push({
        type: 'garment',
        id: garment.id,
        label: garment.name,
        sublabel: `${garment.code ? `${garment.code} · ` : ''}${garment.category} · ${formatPrice(garment.basePrice)}`,
        image: garment.image,
        href: `product.html?garment=${encodeURIComponent(garment.id)}`,
        match: hit.labelMatch,
        value: hit.value
      })
    }
  }

  for (const design of getDesigns()) {
    const hit = score([design.name, design.collection, design.category, design.code], needle)
    if (hit) {
      results.push({
        type: 'design',
        id: design.id,
        label: design.name,
        sublabel: `${design.code} · ${design.collection}`,
        image: design.image,
        href: `product.html?garment=classic-tee&design=${encodeURIComponent(design.id)}`,
        match: hit.labelMatch,
        value: hit.value
      })
    }
  }

  for (const collection of getDesignCollections()) {
    const hit = score([collection], needle)
    if (hit) {
      results.push({
        type: 'collection',
        id: `collection-${collection}`,
        label: collection,
        sublabel: 'Design collection',
        href: `index.html?collection=${encodeURIComponent(collection)}#designs`,
        match: hit.labelMatch,
        value: hit.value
      })
    }
  }

  for (const category of getPurchasableCategories()) {
    const hit = score([category], needle)
    if (hit) {
      results.push({
        type: 'category',
        id: `category-${category}`,
        label: category,
        sublabel: 'Shop category',
        category,
        match: hit.labelMatch,
        value: hit.value
      })
    }
  }

  return results
    .sort((a, b) => a.value - b.value || TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.label.localeCompare(b.label))
    .slice(0, limit)
}
