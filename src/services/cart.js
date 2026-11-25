import { printsForItem, printsKey } from '../data/catalogue.js'
import { familyDiscounts, familyDiscountTotal } from './family.js'

export const CART_STORAGE_KEY = 'intersacks-cart'
export const MAX_QUANTITY = 10

export function createMemoryStorage() {
  const data = {}
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null
    },
    setItem(key, value) {
      data[key] = String(value)
    },
    removeItem(key) {
      delete data[key]
    }
  }
}

function browserStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    /* Private mode and blocked storage fall through to memory. */
  }
  return createMemoryStorage()
}

export function normalizeQuantity(value) {
  const quantity = Number(value ?? 1)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error('Enter a quantity from 1 to 10.')
  }
  return quantity
}

/* Every line carries `prints` ([{ placement, designId, designName }]).
   Bags saved before multi-spot printing held one designId + placement; convert those. */
export function withPrints(item) {
  if (Array.isArray(item.prints)) return item
  const prints = printsForItem(item).map((print) => ({ ...print, designName: item.designName }))
  const { designId: _designId, placement: _placement, ...rest } = item
  return { ...rest, prints }
}

export class Cart {
  constructor(storage = browserStorage()) {
    this.storage = storage
    this.items = this.loadFromStorage()
  }

  loadFromStorage() {
    try {
      const stored = this.storage.getItem(CART_STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item === 'object').map(withPrints) : []
    } catch {
      return []
    }
  }

  saveToStorage() {
    this.storage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items))
  }

  addItem(item) {
    const quantity = normalizeQuantity(item.quantity ?? 1)
    item = withPrints(item)
    const key = printsKey(item.prints)
    const existingIndex = this.items.findIndex((entry) =>
      entry.garmentId === item.garmentId &&
      entry.colour === item.colour &&
      entry.size === item.size &&
      printsKey(entry.prints) === key
    )

    if (existingIndex >= 0) {
      const current = this.items[existingIndex].quantity
      if (current + quantity > MAX_QUANTITY) {
        throw new Error(`You can order up to ${MAX_QUANTITY} of the same piece. Your bag already has ${current}.`)
      }
      this.items[existingIndex].quantity = current + quantity
    } else {
      this.items.push({ ...item, quantity })
    }

    this.saveToStorage()
    return this.items
  }

  removeItem(index) {
    this.items.splice(index, 1)
    this.saveToStorage()
    return this.items
  }

  updateQuantity(index, quantity) {
    if (quantity <= 0) return this.removeItem(index)
    this.items[index].quantity = normalizeQuantity(quantity)
    this.saveToStorage()
    return this.items
  }

  /* Move one line to another place in the bag (drag to reorder). */
  moveItem(from, to) {
    if (from === to || from < 0 || to < 0 || from >= this.items.length || to >= this.items.length) return this.items
    const [item] = this.items.splice(from, 1)
    this.items.splice(to, 0, item)
    this.saveToStorage()
    return this.items
  }

  clear() {
    this.items = []
    this.saveToStorage()
    return this.items
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0)
  }

  /* Family Kit discount on matching tees (see family.js). */
  getDiscounts() {
    return familyDiscounts(this.items)
  }

  getDiscount() {
    return familyDiscountTotal(this.items)
  }

  getTotal() {
    return this.getSubtotal() - this.getDiscount()
  }

  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0)
  }

  /* Drop saved lines that can no longer be ordered, such as pieces taken out of the shop. */
  prune(isValid) {
    const kept = this.items.filter(isValid)
    if (kept.length !== this.items.length) {
      this.items = kept
      this.saveToStorage()
    }
    return this.items
  }

  isEmpty() {
    return this.items.length === 0
  }
}
