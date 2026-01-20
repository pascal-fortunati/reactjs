// Bouton favoris (ajout/suppression via React Query)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addFavorite, deleteFavorite } from '../services/api'

// Invalide le cache 'favorites' après mutation
function FavoriteButton({ movie, isFavorite }) {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: () =>
      addFavorite({
        movie_id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date || movie.first_air_date,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFavorite(movie.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  // Déclenche l'ajout ou la suppression
  const handleClick = (event) => {
    event.preventDefault()
    if (isFavorite) {
      deleteMutation.mutate()
    } else {
      addMutation.mutate()
    }
  }

  const loading = addMutation.isPending || deleteMutation.isPending

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
        isFavorite
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'border border-red-600 text-red-500 hover:bg-red-600 hover:text-white'
      }`}
      disabled={loading}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isFavorite ? 'Retirer' : 'Favori'}
    </button>
  )
}

export default FavoriteButton
