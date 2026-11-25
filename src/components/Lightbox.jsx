import { useEffect, useRef, useState } from 'react'
import { Photo } from './Photo.jsx'
import { ZoomStage } from './ZoomStage.jsx'

/* Fullscreen photo viewer on a native modal <dialog>: Esc closes it, focus is trapped inside
   and returns to the opener. The photo zooms and pans with the shared ZoomStage controls.
   views: [{ label, src, alt }]. children: actions shown under the photo (add to bag, links). */
export function Lightbox({ open, onClose, title, views, children }) {
  const dialogRef = useRef(null)
  const [index, setIndex] = useState(0)
  const view = views[Math.min(index, views.length - 1)]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    if (open && !dialog.open) {
      setIndex(0)
      // Grow out of the card that was tapped: start the expand from the opener's centre.
      const opener = document.activeElement?.getBoundingClientRect?.()
      if (opener && opener.width) dialog.style.setProperty('--expand-origin', `${opener.left + opener.width / 2}px ${opener.top + opener.height / 2}px`)
      else dialog.style.removeProperty('--expand-origin')
      dialog.showModal()
      document.documentElement.classList.add('has-lightbox')
    } else if (!open && dialog.open) {
      dialog.close()
    }
    return undefined
  }, [open])

  useEffect(() => () => document.documentElement.classList.remove('has-lightbox'), [])

  function handleClose() {
    document.documentElement.classList.remove('has-lightbox')
    onClose()
  }

  function onKeyDown(event) {
    if (views.length < 2 || event.target.closest?.('.zoom-stage')) return
    if (event.key === 'ArrowRight') setIndex((current) => (current + 1) % views.length)
    if (event.key === 'ArrowLeft') setIndex((current) => (current - 1 + views.length) % views.length)
  }

  return (
    <dialog ref={dialogRef} className="lightbox" aria-label={title} onClose={handleClose} onKeyDown={onKeyDown}>
      {open && view ? (
        <div className="lightbox-inner">
          <header className="lightbox-head">
            <h2>{title}</h2>
            <button type="button" className="zoom-btn lightbox-close" onClick={() => dialogRef.current?.close()} aria-label="Close">✕</button>
          </header>
          <ZoomStage className="is-fill" label={view.alt} resetKey={`${title}-${index}`}>
            <Photo layout="hero" framed={false} eager className="lightbox-photo" src={view.src} alt={view.alt} />
          </ZoomStage>
          <div className="lightbox-foot">
            {views.length > 1 ? (
              <div className="collection-chips" role="group" aria-label="View">
                {views.map((entry, position) => (
                  <button key={entry.label} type="button" className="chip" aria-pressed={position === index} onClick={() => setIndex(position)}>
                    {entry.label}
                  </button>
                ))}
              </div>
            ) : <p className="lightbox-label">{view.label}</p>}
            {children}
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
