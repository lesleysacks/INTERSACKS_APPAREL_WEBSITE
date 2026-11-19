import './lib/installPopoverPolyfill.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CustomPage } from './pages/CustomPage.jsx'
import './styles/global.css'

const page = document.body.dataset.page
const PAGES = { product: ProductPage, cart: CartPage, custom: CustomPage }
const Page = PAGES[page] || HomePage

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <Page />
    </CartProvider>
  </StrictMode>
)
