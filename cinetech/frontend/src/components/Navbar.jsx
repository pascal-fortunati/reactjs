// Barre de navigation principale (sticky + responsive)
import { Link, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { useSearch } from '../context/SearchContext'

// Affiche le logo, les liens, et la recherche
function Navbar() {
  const [open, setOpen] = useState(false)
  const { openSearch } = useSearch()
  return (
    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-3 text-xl font-semibold tracking-tight">
          <img src="/l-cine.png" alt="Cinéthèque" className="h-12 md:h-13" />
        </Link>
        {/* Liens de navigation desktop */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          <NavLink to="/" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Accueil</NavLink>
          <NavLink to="/films" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Films</NavLink>
          <NavLink to="/series" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Séries</NavLink>
          <NavLink to="/nouveautes" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Nouveautés</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Favoris</NavLink>
        </nav>
        {/* Actions: recherche (desktop) et menu mobile */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Recherche"
            className="hidden h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition hover:bg-neutral-900 hover:text-white sm:flex"
            onClick={() => {
              setOpen(false)
              openSearch()
            }}
          >
            <span className="material-symbols-outlined">search</span>
          </button>
          <button type="button" aria-label="Menu" onClick={() => setOpen((v) => !v)} className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition hover:bg-neutral-900 hover:text-white sm:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
      {/* Menu mobile conditionnel */}
      {open ? (
        <div className="flex w-full items-center gap-6 border-t border-neutral-800 px-6 py-3 text-sm sm:hidden">
          <NavLink to="/films" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Films</NavLink>
          <NavLink to="/series" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Séries</NavLink>
          <NavLink to="/nouveautes" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Nouveautés</NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `font-medium transition ${isActive ? 'text-red-600' : 'text-neutral-300 hover:text-red-600'}`}>Favoris</NavLink>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
