// Contexte de recherche: ouverture/fermeture de la modale
import { createContext, useContext, useMemo, useState } from 'react'

const SearchContext = createContext(null)

// Fournit les actions open/close/toggle et l'état courant
export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false)

  const value = useMemo(
    () => ({
      searchOpen: open,
      openSearch: () => setOpen(true),
      closeSearch: () => setOpen(false),
      toggleSearch: () => setOpen((v) => !v),
    }),
    [open],
  )

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

// Hook utilitaire pour consommer le contexte
export function useSearch() {
  return useContext(SearchContext)
}
