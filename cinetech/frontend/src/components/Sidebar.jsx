// Barre latérale compacte avec liens rapides
import { NavLink } from 'react-router-dom'

// Icône de marque + raccourcis Accueil/Favoris
function Sidebar() {
  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r border-red-900/60 bg-black/95 py-4 text-xs text-neutral-400 sm:w-20">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-md bg-red-600 text-sm font-bold text-white shadow-lg">
        CT
      </div>
      <nav className="flex flex-1 flex-col items-center gap-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex h-9 w-9 items-center justify-center rounded-md transition ${
              isActive ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            }`
          }
          aria-label="Accueil"
        >
          ⌂
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `flex h-9 w-9 items-center justify-center rounded-md transition ${
              isActive ? 'bg-red-600 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
            }`
          }
          aria-label="Favoris"
        >
          ❤
        </NavLink>
      </nav>
      <div className="mt-4 flex flex-col items-center gap-3 text-lg text-neutral-500">
        <button type="button" aria-label="Recherche" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-900 hover:text-white">
          🔍
        </button>
        <button type="button" aria-label="Plus" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-900 hover:text-white">
          +
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

