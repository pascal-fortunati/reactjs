// Page Favoris: liste depuis SQLite via backend
import { useQuery } from '@tanstack/react-query'
import { getFavorites } from '../services/api'
import MovieGrid from '../components/MovieGrid'

// Affiche la grille ou messages d’état (erreur/chargement/vide)
function Favorites() {
  const {
    data: favorites,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites(),
  })

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Mes favoris</h2>
      <p className="text-sm text-neutral-300">
        Tu pourras retrouver ici tous les films enregistrés en favoris.
      </p>
      {isError ? (
        <p className="text-sm text-red-500">Impossible de charger les favoris.</p>
      ) : isLoading ? (
        <p className="text-sm text-neutral-300">Chargement des favoris…</p>
      ) : favorites && favorites.length > 0 ? (
        <MovieGrid movies={favorites} />
      ) : (
        <p className="text-sm text-neutral-400">Aucun favori pour le moment.</p>
      )}
    </section>
  )
}

export default Favorites
