// Modale de recherche (overlay + raccourcis clavier)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../context/SearchContext'
import SearchBar from './SearchBar'

// Ouvre/ferme la modale et déclenche la navigation vers /search
function SearchModal() {
  const { searchOpen, closeSearch } = useSearch()
  const navigate = useNavigate()

  useEffect(() => {
    if (!searchOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [searchOpen, closeSearch])

  // Navigue vers la page de résultats avec le paramètre q
  const onSearch = (q) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  if (!searchOpen) return null

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/60" onClick={closeSearch} />
      <div className="absolute left-1/2 top-16 w-full max-w-xl -translate-x-1/2 px-6">
        <div className="rounded-md border border-neutral-700 bg-neutral-900/90 p-3 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neutral-400">search</span>
            <div className="flex-1">
              <SearchBar onSearch={onSearch} placeholder="Rechercher un film ou une série…" autoFocus />
            </div>
            <button
              type="button"
              aria-label="Fermer"
              onClick={closeSearch}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
