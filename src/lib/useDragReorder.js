import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

/* Drag to reorder a vertical list by a handle in each item.
   The grabbed item lifts (105%, motion.css) and follows the pointer; the items it passes slide
   out of its way (200ms). On release the list order is committed once and the item glides into
   its new slot. Arrow Up / Arrow Down on a focused handle move the item one place.
   onMove(from, to) must reorder the data; React then moves the existing DOM nodes (stable keys). */
const SLIDE_MS = 200
const EDGE = 64

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* Animate every item from where it was to where it is now (FLIP). */
function glide(elements, before) {
  if (reducedMotion()) return []
  return elements.map((element, position) => {
    const dy = before[position] - element.getBoundingClientRect().top
    if (!dy) return null
    return element.animate([{ translate: `0 ${dy}px` }, { translate: '0 0' }], { duration: SLIDE_MS, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' })
  }).filter(Boolean)
}

export function useDragReorder(listRef, onMove, { announce } = {}) {
  const drag = useRef(null)
  const onMoveRef = useRef(onMove)
  onMoveRef.current = onMove

  useEffect(() => () => {
    if (drag.current) cancelAnimationFrame(drag.current.frame)
    document.documentElement.classList.remove('is-reordering')
  }, [])

  function layout(state, clientY) {
    const scrolled = window.scrollY - state.startScroll
    const dy = clientY - state.startY + scrolled
    state.item.style.translate = `0 ${dy}px`
    const centre = state.tops[state.index] + state.heights[state.index] / 2 + dy
    // The slot is the number of other items whose middle is above the grabbed item's middle.
    const target = state.tops.filter((top, position) => position !== state.index && top + state.heights[position] / 2 < centre).length
    state.target = target
    state.items.forEach((element, position) => {
      if (position === state.index) return
      let shift = 0
      if (position > state.index && position <= target) shift = -state.step
      else if (position < state.index && position >= target) shift = state.step
      element.style.translate = shift ? `0 ${shift}px` : ''
    })
  }

  function autoScroll() {
    const state = drag.current
    if (!state) return
    const { lastY } = state
    let speed = 0
    if (lastY < EDGE) speed = -Math.min(18, (EDGE - lastY) / 3)
    else if (lastY > window.innerHeight - EDGE) speed = Math.min(18, (lastY - (window.innerHeight - EDGE)) / 3)
    if (speed) {
      window.scrollBy(0, speed)
      layout(state, lastY)
    }
    state.frame = requestAnimationFrame(autoScroll)
  }

  function onPointerDown(event, index) {
    if (event.button !== 0 || drag.current) return
    const list = listRef.current
    if (!list) return
    const items = [...list.children]
    const item = items[index]
    const rects = items.map((element) => element.getBoundingClientRect())
    const gap = items.length > 1 ? rects[1].top - rects[0].bottom : 0
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId,
      index,
      target: index,
      items,
      item,
      handle: event.currentTarget,
      tops: rects.map((rect) => rect.top),
      heights: rects.map((rect) => rect.height),
      step: rects[index].height + gap,
      startY: event.clientY,
      startScroll: window.scrollY,
      lastY: event.clientY,
      frame: 0
    }
    item.classList.add('is-lifted')
    list.classList.add('is-dragging')
    document.documentElement.classList.add('is-reordering')
    drag.current.frame = requestAnimationFrame(autoScroll)
  }

  function onPointerMove(event) {
    const state = drag.current
    if (!state || event.pointerId !== state.pointerId) return
    state.lastY = event.clientY
    layout(state, event.clientY)
  }

  function finish(event, cancelled = false) {
    const state = drag.current
    if (!state || event.pointerId !== state.pointerId) return
    drag.current = null
    cancelAnimationFrame(state.frame)
    const list = listRef.current
    const from = state.index
    const to = cancelled ? from : state.target
    const liftedTop = state.item.getBoundingClientRect().top
    // The siblings already sit where the new order puts them, so drop their offsets instantly.
    state.items.forEach((element) => {
      element.style.transition = 'none'
      element.style.translate = ''
    })
    if (to !== from) flushSync(() => onMoveRef.current(from, to))
    list?.classList.remove('is-dragging')
    document.documentElement.classList.remove('is-reordering')
    requestAnimationFrame(() => state.items.forEach((element) => { element.style.transition = '' }))
    const settle = glide([state.item], [liftedTop])
    const drop = () => state.item.classList.remove('is-lifted')
    if (settle.length) Promise.allSettled(settle.map((animation) => animation.finished)).then(drop)
    else drop()
    if (to !== from) announce?.(to, state.items.length)
    state.handle?.focus?.({ preventScroll: true })
  }

  function onKeyDown(event, index, count) {
    if (drag.current) {
      if (event.key === 'Escape') finish({ pointerId: drag.current.pointerId }, true)
      return
    }
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (!delta) return
    const to = index + delta
    if (to < 0 || to >= count) return
    event.preventDefault()
    const handle = event.currentTarget
    const items = [...(listRef.current?.children || [])]
    const before = items.map((element) => element.getBoundingClientRect().top)
    flushSync(() => onMoveRef.current(index, to))
    // Same nodes, new order: measure them in the order they were before the move.
    glide(items, before)
    handle.focus({ preventScroll: true })
    handle.closest('li')?.scrollIntoView({ block: 'nearest' })
    announce?.(to, count)
  }

  return {
    handleProps(index, count) {
      return {
        onPointerDown: (event) => onPointerDown(event, index),
        onPointerMove,
        onPointerUp: (event) => finish(event),
        onPointerCancel: (event) => finish(event, true),
        onLostPointerCapture: (event) => finish(event),
        onKeyDown: (event) => onKeyDown(event, index, count)
      }
    }
  }
}
