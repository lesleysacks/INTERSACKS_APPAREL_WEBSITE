/* Progressive enhancement for view transitions.
   - Cross-document: the clicked product card's photo morphs into the customiser preview.
   - Same-document: swapping artwork, colour or print position cross-fades the tee preview
     without animating the whole page. */

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function installPageTransitions() {
  if (typeof window === 'undefined' || !('onpageswap' in window)) return

  let lastPhoto = null

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[data-vt="garment"]')
    lastPhoto = link ? link.querySelector('img') : null
  })

  window.addEventListener('pageswap', (event) => {
    if (!event.viewTransition || !lastPhoto) return
    const destination = event.activation?.entry?.url || ''
    if (!destination.includes('product.html')) {
      lastPhoto = null
      return
    }
    lastPhoto.style.viewTransitionName = 'product-photo'
  })

  // Coming back via the back button restores this page from the bfcache: clear the name.
  window.addEventListener('pageshow', () => {
    if (lastPhoto) lastPhoto.style.viewTransitionName = ''
    lastPhoto = null
  })
}

/* Run a DOM update inside a same-document view transition when supported.
   `update` must apply the change synchronously (wrap React updates in flushSync). */
export function withPreviewTransition(update) {
  if (typeof document === 'undefined' || !document.startViewTransition || reducedMotion()) {
    update()
    return
  }
  const root = document.documentElement
  root.classList.add('vt-preview')
  const transition = document.startViewTransition(update)
  transition.finished.finally(() => root.classList.remove('vt-preview'))
}
