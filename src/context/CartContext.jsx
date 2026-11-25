import { createContext, useContext, useRef, useState } from 'react'
import { Cart, createMemoryStorage } from '../services/cart.js'
import { getDesignById, getGarmentById, isPurchasable, printsForItem } from '../data/catalogue.js'

function stillOrderable(item) {
  if (!isPurchasable(getGarmentById(item?.garmentId))) return false
  return printsForItem(item).every((print) => Boolean(getDesignById(print.designId)?.active))
}

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const cartRef = useRef(null)
  if (!cartRef.current) {
    cartRef.current = new Cart()
    cartRef.current.prune(stillOrderable)
  }
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((version) => version + 1)
  const cart = cartRef.current

  const api = {
    items: cart.items,
    count: cart.getItemCount(),
    subtotal: cart.getSubtotal(),
    discount: cart.getDiscount(),
    discounts: cart.getDiscounts(),
    total: cart.getTotal(),
    empty: cart.isEmpty(),
    addItem(item) {
      cart.addItem(item)
      refresh()
    },
    /* Several lines at once (a Family Kit). All are checked before any is added. */
    addItems(items) {
      const trial = new Cart(createMemoryStorage())
      trial.items = cart.items.map((entry) => ({ ...entry }))
      for (const item of items) trial.addItem(item)
      for (const item of items) cart.addItem(item)
      refresh()
    },
    updateQuantity(index, quantity) {
      cart.updateQuantity(index, quantity)
      refresh()
    },
    removeItem(index) {
      cart.removeItem(index)
      refresh()
    },
    moveItem(from, to) {
      cart.moveItem(from, to)
      refresh()
    },
    clear() {
      cart.clear()
      refresh()
    },
    cart
  }

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used within CartProvider')
  return value
}
