import { useEffect, useRef, useState } from 'react'

/* React wrapper for the 3D tee. three.js is imported only when this mounts,
   so the rest of the site never downloads it.
   front / back: [{ src, styles }] prints for each face. */
export function Tee3D({ colour, front, back, side, label, onUnavailable, onSide }) {
  const hostRef = useRef(null)
  const viewerRef = useRef(null)
  const [state, setState] = useState('loading')
  const latest = useRef({ colour, front, back })
  latest.current = { colour, front, back }
  const signature = JSON.stringify([colour, front, back])

  useEffect(() => {
    let cancelled = false
    import('../lib/tee3d.js')
      .then(({ createTeeViewer, supportsWebGL }) => {
        if (cancelled || !hostRef.current) return
        if (!supportsWebGL()) throw new Error('WebGL unavailable')
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
        viewerRef.current = createTeeViewer(hostRef.current, { reducedMotion })
        viewerRef.current.update(latest.current)
        if (side === 'back') viewerRef.current.showSide('back')
        setState('ready')
      })
      .catch(() => {
        if (cancelled) return
        setState('failed')
        onUnavailable?.()
      })
    return () => {
      cancelled = true
      viewerRef.current?.dispose()
      viewerRef.current = null
    }
    // Mount once; option changes are pushed through update() below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    viewerRef.current?.update(latest.current)
  }, [signature])

  useEffect(() => {
    viewerRef.current?.showSide(side === 'back' ? 'back' : 'front')
  }, [side])

  const turn = (next) => {
    viewerRef.current?.showSide(next)
    onSide?.(next)
  }

  return (
    <div className="tee3d">
      <div ref={hostRef} className="tee3d-host" role="img" aria-label={label} data-state={state} />
      {state === 'loading' ? <p className="tee3d-status">Loading 3D view…</p> : null}
      {state === 'failed' ? <p className="tee3d-status">3D view is not available on this device.</p> : null}
      <div className="zoom-bar tee3d-bar">
        <button type="button" className="zoom-btn" onClick={() => turn('front')}>Front</button>
        <button type="button" className="zoom-btn" onClick={() => turn('back')}>Back</button>
        <span className="zoom-hint">Drag to spin · scroll or pinch to zoom</span>
      </div>
    </div>
  )
}
