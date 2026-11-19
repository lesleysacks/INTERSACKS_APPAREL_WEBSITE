import { useEffect, useRef, useState } from 'react'
import { Photo } from './Photo.jsx'
import { heroShowcase, lookbookHref } from '../data/lookbook.js'

const INTERVAL = 4500

function prefersReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* Cross-fading hero showcase of the lookbook sheets.
   Auto-advances only when motion is allowed, always with a visible pause control,
   and pauses while the pointer or keyboard focus is inside it. */
export function HeroShowcase() {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const [held, setHeld] = useState(false)
  const stageRef = useRef(null)
  const active = heroShowcase[index]

  useEffect(() => {
    if (!playing || held) return undefined
    const timer = setTimeout(() => setIndex((current) => (current + 1) % heroShowcase.length), INTERVAL)
    return () => clearTimeout(timer)
  }, [index, playing, held])

  /* Pointer tilt: a light 3D lean toward the cursor, written as CSS variables. */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || prefersReducedMotion() || !matchMedia('(hover: hover)').matches) return undefined
    let frame = 0
    const move = (event) => {
      const rect = stage.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        stage.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`)
        stage.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`)
      })
    }
    const reset = () => {
      cancelAnimationFrame(frame)
      stage.style.setProperty('--tilt-x', '0deg')
      stage.style.setProperty('--tilt-y', '0deg')
    }
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerleave', reset)
    return () => {
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerleave', reset)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <figure
      className="hero-figure hero-showcase"
      aria-roledescription="carousel"
      aria-label="Lookbook highlights"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false) }}
    >
      <a className="showcase-stage" href={lookbookHref(active)} ref={stageRef}>
        {heroShowcase.map((entry, i) => (
          <div
            key={entry.id}
            className={`showcase-slide${i === index ? ' is-active' : ''}`}
            aria-hidden={i === index ? undefined : 'true'}
          >
            <Photo
              priority={i === 0}
              eager={i !== 0}
              framed={false}
              layout="hero"
              className="hero-photo"
              src={entry.image}
              alt={i === index ? entry.alt : ''}
            />
          </div>
        ))}
        <span className="visually-hidden">Customise {active.name}</span>
      </a>
      <figcaption className="showcase-bar">
        <span className="showcase-caption" aria-live={playing ? 'off' : 'polite'}>
          <strong>{active.name}</strong>
          <span>{active.tagline}</span>
        </span>
        <span className="showcase-controls">
          {heroShowcase.map((entry, i) => (
            <button
              key={entry.id}
              type="button"
              className="showcase-dot"
              aria-label={`Show ${entry.name}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
          <button type="button" className="showcase-toggle" onClick={() => setPlaying((value) => !value)}>
            {playing ? 'Pause' : 'Play'}
          </button>
        </span>
      </figcaption>
    </figure>
  )
}
