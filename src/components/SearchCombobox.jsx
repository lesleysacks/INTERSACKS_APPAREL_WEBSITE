import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { getSearchSuggestions } from '../data/search.js'
import { Photo } from './Photo.jsx'

const TYPE_LABEL = { garment: 'Piece', design: 'Design', collection: 'Collection', category: 'Category' }

function Highlight({ text, match }) {
  if (!match) return text
  return (
    <>
      {text.slice(0, match.start)}
      <mark>{text.slice(match.start, match.end)}</mark>
      {text.slice(match.end)}
    </>
  )
}

/* Google-style type-ahead search (ARIA 1.2 combobox with a listbox popup).
   `onSearch(text)` filters the shop; `onCategory(name)` picks a shop category.
   Pieces, designs and collections navigate to their own page. */
export function SearchCombobox({ value, onSearch, onCategory }) {
  const id = useId()
  const listId = `${id}-list`
  const rootRef = useRef(null)
  const [text, setText] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const suggestions = useMemo(() => getSearchSuggestions(text), [text])
  const showList = open && text.trim().length > 0

  useEffect(() => {
    const close = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  function choose(item) {
    setOpen(false)
    setActive(-1)
    if (!item) {
      onSearch(text)
      return
    }
    if (item.type === 'category') {
      setText('')
      onSearch('')
      onCategory(item.category)
      return
    }
    window.location.href = item.href
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setActive((index) => Math.min(index + 1, suggestions.length))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, -1))
    } else if (event.key === 'Escape') {
      if (showList) {
        event.preventDefault()
        setOpen(false)
        setActive(-1)
      } else if (text) {
        setText('')
        onSearch('')
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      choose(active >= 0 && active < suggestions.length ? suggestions[active] : null)
    }
  }

  const optionId = (index) => `${id}-opt-${index}`
  const allIndex = suggestions.length

  return (
    <div className="combo" ref={rootRef}>
      <label htmlFor={`${id}-input`} className="visually-hidden">Search the shop</label>
      <span className="combo-icon" aria-hidden="true">⌕</span>
      <input
        id={`${id}-input`}
        className="combo-input"
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        enterKeyHint="search"
        placeholder="Type to search: tees, panther, faith, sets…"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setOpen(true)
          setActive(-1)
          if (!event.target.value) onSearch('')
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <p className="visually-hidden" aria-live="polite">
        {showList ? `${suggestions.length} ${suggestions.length === 1 ? 'suggestion' : 'suggestions'}` : ''}
      </p>
      <ul id={listId} role="listbox" className="combo-list" hidden={!showList} aria-label="Search suggestions">
        {suggestions.map((item, index) => (
          <li
            key={item.id}
            id={optionId(index)}
            role="option"
            aria-selected={index === active}
            className="combo-option"
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => choose(item)}
            onPointerEnter={() => setActive(index)}
          >
            <span className="combo-thumb" aria-hidden="true">
              {item.image ? <Photo layout="thumb" framed={false} src={item.image} alt="" /> : <span>{item.label.slice(0, 1)}</span>}
            </span>
            <span className="combo-text">
              <span className="combo-label"><Highlight text={item.label} match={item.match} /></span>
              <span className="combo-sub">{item.sublabel}</span>
            </span>
            <span className="combo-type">{TYPE_LABEL[item.type]}</span>
          </li>
        ))}
        <li
          id={optionId(allIndex)}
          role="option"
          aria-selected={active === allIndex}
          className="combo-option combo-all"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => choose(null)}
          onPointerEnter={() => setActive(allIndex)}
        >
          {suggestions.length ? `Show all pieces matching “${text.trim()}”` : `No matches for “${text.trim()}”. Try another word.`}
        </li>
      </ul>
    </div>
  )
}
