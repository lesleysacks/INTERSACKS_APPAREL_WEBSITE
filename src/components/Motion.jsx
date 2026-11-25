import { useEffect, useRef } from 'react'

/* Shared motion pieces. The timings live in src/styles/motion.css (section 9);
   everything that moves on its own is opt-in under prefers-reduced-motion: no-preference. */

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/* A number whose digits roll to the new value like an odometer, each digit 100ms after the one
   to its right. Screen readers get the plain text; the rolling strips are hidden from them.
   Columns are keyed by position from the right, so the units digit stays the units digit. */
export function RollingNumber({ value, prefix = '', className = '' }) {
  const text = `${prefix}${value}`
  const chars = [...text]
  let digitFromRight = 0
  const parts = chars.map((char, position) => ({ char, fromRight: chars.length - 1 - position })).reverse().map((part) => {
    if (!/\d/.test(part.char)) return { ...part, digit: false }
    const entry = { ...part, digit: true, order: digitFromRight }
    digitFromRight += 1
    return entry
  }).reverse()

  return (
    <span className={`roll ${className}`.trim()}>
      <span className="visually-hidden">{text}</span>
      <span className="roll-track" aria-hidden="true">
        {parts.map((part) => (part.digit ? (
          <span key={`d${part.fromRight}`} className="roll-digit" style={{ '--d': Number(part.char), '--i': part.order }}>
            <span className="roll-strip">{DIGITS.map((digit) => <span key={digit}>{digit}</span>)}</span>
          </span>
        ) : (
          <span key={`s${part.fromRight}`} className="roll-static">{part.char}</span>
        )))}
      </span>
    </span>
  )
}

/* Success mark: the circle draws, then the tick (470ms in all). Remount it (change its key)
   to play it again. Decorative: the words next to it carry the meaning. */
export function SuccessTick() {
  return (
    <svg className="success-tick" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle className="success-tick-circle" cx="12" cy="12" r="10" pathLength="1" />
      <path className="success-tick-mark" d="M7 12.5l3.2 3.2L17 9" pathLength="1" />
    </svg>
  )
}

const PULL_READY = 110
const PULL_MAX = 180
const CONTENT_RATIO = 0.35

/* Pull to refresh on touch screens. At the very top of the page, pulling down moves the
   refresh badge with the finger (100%) and the page content at 35% of that distance.
   Let go past the line and the page reloads; let go early and everything springs back.
   The browser's own reload button does the same thing for anyone not using a gesture. */
export function PullToRefresh({ children }) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || !('ontouchstart' in window)) return undefined
    let startY = null
    let distance = 0
    let pulling = false

    function setPull(px, state) {
      distance = px
      root.style.setProperty('--pull', `${px}px`)
      root.style.setProperty('--pull-progress', Math.min(px / PULL_READY, 1).toFixed(3))
      if (state) root.dataset.pull = state
      else delete root.dataset.pull
    }

    function onStart(event) {
      if (event.touches.length !== 1 || window.scrollY > 0 || root.dataset.pull === 'refreshing') return
      if (document.documentElement.classList.contains('has-lightbox')) return
      if (event.target.closest?.('[data-no-pull], input, select, textarea, .zoom-stage, dialog')) return
      startY = event.touches[0].clientY
      pulling = false
    }

    function onMove(event) {
      if (startY === null) return
      const dy = event.touches[0].clientY - startY
      if (window.scrollY > 0 || (dy <= 0 && !pulling)) {
        startY = null
        if (pulling) setPull(0, null)
        return
      }
      if (!pulling && dy < 6) return
      pulling = true
      // Past the line the finger keeps going but the pull slows down, up to a cap.
      const px = dy <= PULL_READY ? dy : Math.min(PULL_MAX, PULL_READY + (dy - PULL_READY) * 0.5)
      setPull(Math.max(0, px), px >= PULL_READY ? 'ready' : 'pulling')
    }

    function onEnd() {
      if (startY === null) return
      startY = null
      if (!pulling) return
      pulling = false
      if (distance >= PULL_READY) {
        setPull(PULL_READY * 0.6, 'refreshing')
        setTimeout(() => window.location.reload(), 450)
      } else {
        setPull(0, null)
      }
    }

    root.addEventListener('touchstart', onStart, { passive: true })
    root.addEventListener('touchmove', onMove, { passive: true })
    root.addEventListener('touchend', onEnd)
    root.addEventListener('touchcancel', onEnd)
    return () => {
      root.removeEventListener('touchstart', onStart)
      root.removeEventListener('touchmove', onMove)
      root.removeEventListener('touchend', onEnd)
      root.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  return (
    <div className="ptr" ref={rootRef} style={{ '--content-ratio': CONTENT_RATIO }}>
      <div className="ptr-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" /></svg>
      </div>
      <div className="ptr-content">{children}</div>
    </div>
  )
}
