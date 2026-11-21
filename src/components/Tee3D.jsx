import { useEffect, useRef, useState } from 'react'

/* React wrapper for the 3D tee. three.js is imported only when this mounts,
   so the rest of the site never downloads it. */
export function Tee3D({ colour, designSrc, placement, label, onUnavailable }) {
  const hostRef = useRef(null)
  const viewerRef = useRef(null)
  const [state, setState] = useState('loading')
  const latest = useRef({ colour, designSrc, placement })
  latest.current = { colour, designSrc, placement }

  useEffect(() => {
    let cancelled = false
    import('../lib/tee3d.js')
      .then(({ createTeeViewer, supportsWebGL }) => {
        if (cancelled || !hostRef.current) return
        if (!supportsWebGL()) throw new Error('WebGL unavailable')
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
        viewerRef.current = createTeeViewer(hostRef.current, { reducedMotion })
        viewerRef.current.update(latest.current)
        if (latest.current.placement?.view === 'back') viewerRef.current.showSide('back')
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
    viewerRef.current?.update({ colour, designSrc, placement })
  }, [colour, designSrc, placement])

  useEffect(() => {
    if (placement?.view === 'back') viewerRef.current?.showSide('back')
  }, [placement?.view])

  return (
    <div className="tee3d">
      <div ref={hostRef} className="tee3d-host" role="img" aria-label={label} data-state={state} />
      {state === 'loading' ? <p className="tee3d-status">Loading 3D view…</p> : null}
      {state === 'failed' ? <p className="tee3d-status">3D view is not available on this device.</p> : null}
      <div className="zoom-bar tee3d-bar">
        <button type="button" className="zoom-btn" onClick={() => viewerRef.current?.showSide('front')}>Front</button>
        <button type="button" className="zoom-btn" onClick={() => viewerRef.current?.showSide('back')}>Back</button>
        <span className="zoom-hint">Drag to spin · scroll or pinch to zoom</span>
      </div>
    </div>
  )
}
