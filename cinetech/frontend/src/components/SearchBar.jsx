import { useEffect, useState } from 'react'

function SearchBar({ onSearch, placeholder = 'Rechercher un film ou une série…', autoFocus = false }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const trimmed = value.trim()
      onSearch(trimmed.length > 0 ? trimmed : '')
    }, 500)

    return () => {
      window.clearTimeout(handle)
    }
  }, [value, onSearch])

  return (
    <input
      type="text"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full max-w-xl rounded-md border border-neutral-700 bg-neutral-900/80 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 shadow-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-700/70"
      aria-label="Rechercher un film ou une série"
    />
  )
}

export default SearchBar
