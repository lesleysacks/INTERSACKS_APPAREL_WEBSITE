import './lib/installPopoverPolyfill.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'
import { CartPage } from './pages/CartPage.jsx'
import './styles/global.css'

const page = document.body.dataset.page
const Page = page === 'product' ? ProductPage : page === 'cart' ? CartPage : HomePage

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <Page />
    </CartProvider>
  </StrictMode>
)
