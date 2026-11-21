import { useCallback, useEffect, useRef, useState } from 'react'

const MIN = 1
const MAX = 4
const STEP = 0.5
const DOUBLE = 2.5

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/* A square stage whose contents (tee photo + artwork layer) zoom and pan together.
   Buttons, wheel, double-click/tap, drag, pinch and keyboard all drive one transform
   on an inner layer (translate + scale, compositor-friendly). Standard pointer events only. */
export function ZoomStage({ label, children, resetKey, focus }) {
  const stageRef = useRef(null)
  const pointers = useRef(new Map())
  const gesture = useRef(null)
  const lastTap = useRef(0)
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const viewRef = useRef(view)
  viewRef.current = view

  const limit = useCallback((next) => {
    const stage = stageRef.current
    const size = stage ? stage.clientWidth : 0
    const scale = clamp(next.scale, MIN, MAX)
    const max = ((scale - 1) * size) / 2
    return { scale, x: clamp(next.x, -max, max), y: clamp(next.y, -max, max) }
  }, [])

  /* Zoom so the point (px, py), relative to the stage centre, stays under the pointer. */
  const zoomAt = useCallback((scale, px = 0, py = 0) => {
    setView((current) => {
      const target = clamp(scale, MIN, MAX)
      const ratio = target / current.scale
      return limit({ scale: target, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio })
    })
  }, [limit])

  const pointFromEvent = (event) => {
    const rect = stageRef.current.getBoundingClientRect()
    return { px: event.clientX - rect.left - rect.width / 2, py: event.clientY - rect.top - rect.height / 2 }
  }

  useEffect(() => {
    setView({ scale: 1, x: 0, y: 0 })
  }, [resetKey])

  /* focus = { key, scale, u, v }: zoom so the point (u, v), as fractions of the stage, sits in the centre. */
  useEffect(() => {
    if (!focus) return
    const size = stageRef.current?.clientWidth || 0
    const px = (focus.u - 0.5) * size
    const py = (focus.v - 0.5) * size
    setView(limit({ scale: focus.scale, x: -px * focus.scale, y: -py * focus.scale }))
    // Only a new focus request (new key) moves the stage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key, limit])

  /* Wheel zooms around the cursor. Page scroll is only taken over while zoomed in or with Ctrl held. */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const onWheel = (event) => {
      // At 1× only a trackpad pinch (sent as ctrl+wheel) zooms, so normal scrolling still moves the page.
      if (viewRef.current.scale === 1 && !event.ctrlKey) return
      event.preventDefault()
      const { px, py } = pointFromEvent(event)
      zoomAt(viewRef.current.scale * Math.exp(-event.deltaY * 0.0025), px, py)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })
    return () => stage.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  function onPointerDown(event) {
    stageRef.current.setPointerCapture?.(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const now = performance.now()
    if (pointers.current.size === 1 && event.pointerType !== 'mouse' && now - lastTap.current < 300) {
      const { px, py } = pointFromEvent(event)
      zoomAt(viewRef.current.scale > 1 ? 1 : DOUBLE, px, py)
      lastTap.current = 0
      return
    }
    lastTap.current = now
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = { type: 'pinch', distance: Math.hypot(a.x - b.x, a.y - b.y), scale: viewRef.current.scale }
    } else {
      gesture.current = { type: 'pan', x: event.clientX, y: event.clientY, startX: viewRef.current.x, startY: viewRef.current.y }
    }
  }

  function onPointerMove(event) {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const g = gesture.current
    if (!g) return
    if (g.type === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const rect = stageRef.current.getBoundingClientRect()
      zoomAt(g.scale * (distance / g.distance), (a.x + b.x) / 2 - rect.left - rect.width / 2, (a.y + b.y) / 2 - rect.top - rect.height / 2)
    } else if (g.type === 'pan' && viewRef.current.scale > 1) {
      setView((current) => limit({ ...current, x: g.startX + event.clientX - g.x, y: g.startY + event.clientY - g.y }))
    }
  }

  function onPointerUp(event) {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size === 1) {
      const [only] = [...pointers.current.values()]
      gesture.current = { type: 'pan', x: only.x, y: only.y, startX: viewRef.current.x, startY: viewRef.current.y }
    } else if (pointers.current.size === 0) {
      gesture.current = null
    }
  }

  function onDoubleClick(event) {
    const { px, py } = pointFromEvent(event)
    zoomAt(viewRef.current.scale > 1 ? 1 : DOUBLE, px, py)
  }

  function onKeyDown(event) {
    const nudge = 40
    const keys = {
      '+': () => zoomAt(view.scale + STEP),
      '=': () => zoomAt(view.scale + STEP),
      '-': () => zoomAt(view.scale - STEP),
      '0': () => setView({ scale: 1, x: 0, y: 0 }),
      ArrowLeft: () => setView((c) => limit({ ...c, x: c.x + nudge })),
      ArrowRight: () => setView((c) => limit({ ...c, x: c.x - nudge })),
      ArrowUp: () => setView((c) => limit({ ...c, y: c.y + nudge })),
      ArrowDown: () => setView((c) => limit({ ...c, y: c.y - nudge }))
    }
    const action = keys[event.key]
    if (!action || (event.key.startsWith('Arrow') && view.scale === 1)) return
    event.preventDefault()
    action()
  }

  const zoomed = view.scale > 1
  return (
    <div className="zoom">
      <div
        ref={stageRef}
        className={`zoom-stage${zoomed ? ' is-zoomed' : ''}`}
        tabIndex={0}
        role="group"
        aria-roledescription="zoomable image"
        aria-label={`${label}. Use plus and minus to zoom, arrow keys to move.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        <div className="zoom-layer" style={{ translate: `${view.x}px ${view.y}px`, scale: String(view.scale) }}>
          {children}
        </div>
      </div>
      <div className="zoom-bar" role="toolbar" aria-label="Zoom">
        <button type="button" className="zoom-btn" onClick={() => zoomAt(view.scale - STEP)} disabled={view.scale <= MIN} aria-label="Zoom out">−</button>
        <span className="zoom-level" aria-live="polite">{Math.round(view.scale * 100)}%</span>
        <button type="button" className="zoom-btn" onClick={() => zoomAt(view.scale + STEP)} disabled={view.scale >= MAX} aria-label="Zoom in">+</button>
        <button type="button" className="zoom-btn zoom-reset" onClick={() => setView({ scale: 1, x: 0, y: 0 })} disabled={!zoomed}>Reset</button>
        <span className="zoom-hint">{zoomed ? 'Drag to look around' : 'Double-click or pinch to zoom'}</span>
      </div>
    </div>
  )
}
