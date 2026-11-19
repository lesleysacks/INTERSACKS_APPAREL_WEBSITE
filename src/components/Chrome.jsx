import { useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { STORE_CONFIG } from '../data/catalogue.js'
import { Photo } from './Photo.jsx'

export const WHATSAPP_DESK_URL = `https://wa.me/${STORE_CONFIG.whatsappNumber}`

export function visibleWhatsAppNumber(number = STORE_CONFIG.whatsappNumber) {
  const digits = String(number)
  if (digits.startsWith('27') && digits.length === 11) {
    return `+27 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  }
  return `+${digits}`
}

const LINKS = [
  { href: 'index.html', label: 'Home', page: 'home' },
  { href: 'index.html#shop', label: 'Shop' },
  { href: 'index.html#collections', label: 'Collections' },
  { href: 'product.html', label: 'Customise', page: 'product' },
  { href: 'custom.html', label: 'Custom orders', page: 'custom' },
  { href: 'index.html#about', label: 'About' },
  { href: 'index.html#contact', label: 'Contact' },
  { href: 'cart.html', label: 'Cart', page: 'cart' }
]

export function ExternalLink({ href, children, className }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

export function SiteHeader({ current }) {
  const headerRef = useRef(null)
  const innerRef = useRef(null)
  const menuRef = useRef(null)
  const { count } = useCart()
  const previousCount = useRef(count)
  const bumped = count > previousCount.current
  useEffect(() => {
    previousCount.current = count
  }, [count])

  useEffect(() => {
    const header = headerRef.current
    const inner = innerRef.current
    const menu = menuRef.current
    if (!header || !inner || !menu) return

    let collapsedWidth = 0
    let frame = 0

    const sync = () => {
      const isWide = header.classList.contains('is-wide')
      if (!isWide && collapsedWidth > 0 && header.clientWidth <= collapsedWidth) return

      const wasOpen = menu.matches(':popover-open') || menu.classList.contains(':popover-open')
      header.classList.add('is-measuring', 'is-wide')
      const fits = inner.scrollWidth <= inner.clientWidth
      header.classList.toggle('is-wide', fits)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => header.classList.remove('is-measuring'))

      if (fits) {
        menu.removeAttribute('popover')
        collapsedWidth = 0
      } else {
        menu.setAttribute('popover', 'auto')
        collapsedWidth = header.clientWidth
        if (wasOpen && typeof menu.showPopover === 'function') {
          try {
            menu.showPopover()
          } catch {
            /* The popover is already showing. */
          }
        }
      }
    }

    const headerObserver = new ResizeObserver(sync)
    const menuObserver = new ResizeObserver(sync)
    headerObserver.observe(header)
    menuObserver.observe(menu)
    sync()

    return () => {
      headerObserver.disconnect()
      menuObserver.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className="site-header" ref={headerRef}>
      <div className="header-inner wrap" ref={innerRef}>
        <a className="site-logo" href="index.html">
          <Photo framed={false} eager layout="mark" src="assets/logo/logo.png" alt="" />
          InterSacks
        </a>
        <nav className="site-nav" aria-label="Primary">
          <button
            className="menu-button"
            type="button"
            popoverTarget="site-menu"
            popoverTargetAction="toggle"
            aria-controls="site-menu"
          >
            Menu
          </button>
          <ul id="site-menu" className="site-menu" popover="auto" ref={menuRef}>
            {LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} aria-current={link.page === current ? 'page' : undefined}>
                  {link.label}
                  {link.page === 'cart' && count ? <span key={count} className={`cart-count${bumped ? ' is-bumped' : ''}`}><span className="visually-hidden">, </span>{count}<span className="visually-hidden"> items</span></span> : null}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-name">InterSacks Apparel</p>
          <p>Independent South African streetwear. Original artwork, heavyweight garments, and made-to-order pieces from InterSacks Holdings.</p>
        </div>
        <div>
          <h2>Visit</h2>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="index.html#shop">Shop</a></li>
            <li><a href="index.html#collections">Collections</a></li>
            <li><a href="product.html">Customise</a></li>
            <li><a href="custom.html">Custom orders</a></li>
            <li><a href="index.html#about">About</a></li>
            <li><a href="index.html#contact">Contact</a></li>
            <li><a href="cart.html">Cart</a></li>
          </ul>
        </div>
        <div>
          <h2>Orders</h2>
          <ul>
            <li><ExternalLink href={WHATSAPP_DESK_URL}>WhatsApp order desk</ExternalLink></li>
            <li><a href="index.html#how">How customisation works</a></li>
            <li><a href="mailto:hello@intersacks.co.za">hello@intersacks.co.za</a></li>
            <li><ExternalLink href="https://www.instagram.com/intersacks.apparel/">Instagram @intersacks.apparel</ExternalLink></li>
          </ul>
          <p>Orders are confirmed on WhatsApp before anything is made.</p>
        </div>
      </div>
      <div className="wrap footer-base">
        <p>© 2026 InterSacks Apparel · InterSacks Holdings · Built Different.</p>
      </div>
    </footer>
  )
}

export function Layout({ current, children }) {
  return (
    <div className="page">
      <a className="skip-link visually-hidden" href="#content">Skip to content</a>
      <p className="announcement">Made to order in South Africa · Order in minutes on WhatsApp</p>
      <SiteHeader current={current} />
      <main id="content">{children}</main>
      <SiteFooter />
    </div>
  )
}
