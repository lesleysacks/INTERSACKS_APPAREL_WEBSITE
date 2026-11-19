import { createContext, useContext, useRef, useState } from 'react'
import { Cart } from '../services/cart.js'
import { getDesignById, getGarmentById, isPurchasable } from '../data/catalogue.js'

function stillOrderable(item) {
  if (!isPurchasable(getGarmentById(item?.garmentId))) return false
  return !item.designId || Boolean(getDesignById(item.designId)?.active)
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
    empty: cart.isEmpty(),
    addItem(item) {
      cart.addItem(item)
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
