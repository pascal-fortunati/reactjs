// Page Films: filtres combinables + pagination + favoris
import { useQuery } from '@tanstack/react-query'
import { discoverMovies, getFavorites } from '../services/api'
import { useState } from 'react'
import MovieGrid from '../components/MovieGrid'
import SkeletonMovieCard from '../components/SkeletonMovieCard'
import FavoriteButton from '../components/FavoriteButton'

// Construit la requête Discover TMDB à partir des filtres UI
function Films() {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [year, setYear] = useState('')
  const [ratingMin, setRatingMin] = useState('')
  const [genre, setGenre] = useState('')

  const movieGenres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Aventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comédie' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentaire' },
    { id: 18, name: 'Drame' },
    { id: 10751, name: 'Famille' },
    { id: 14, name: 'Fantastique' },
    { id: 27, name: 'Horreur' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science-Fiction' },
    { id: 53, name: 'Thriller' },
  ]

  // Requête Discover Movies (avec cache par clés de filtres)
  const { data, isLoading } = useQuery({
    queryKey: ['films-discover', page, sortBy, year, ratingMin, genre],
    queryFn: () =>
      discoverMovies({
        sort_by: sortBy,
        page,
        ...(year ? { year: Number(year) } : {}),
        ...(ratingMin ? { vote_average_gte: Number(ratingMin) } : {}),
        ...(genre ? { with_genres: String(genre) } : {}),
      }),
  })

  // Récupère la liste des favoris pour badge sur cartes
  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites(),
  })

  const results = data?.results ?? []
  const currentPage = data?.page ?? page
  const totalPages = data?.total_pages ?? 1
  const favoriteIds = new Set((favorites ?? []).map((f) => f.movie_id))

  const prevDisabled = currentPage <= 1
  const nextDisabled = currentPage >= totalPages

  return (
    <section className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white">Tous les films</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-neutral-800 bg-neutral-900/60 p-3">
          <select
            value={genre}
            onChange={(e) => {
              setPage(1)
              setGenre(e.target.value)
            }}
            className="select-bordered w-44 rounded-md border border-neutral-700 bg-black/70 px-2 py-1 text-sm text-neutral-200 focus:border-red-600"
            aria-label="Filtrer par genre"
          >
            <option value="">Genre</option>
            {movieGenres.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => {
              setPage(1)
              setYear(e.target.value)
            }}
            placeholder="Année"
            min={1900}
            max={new Date().getFullYear()}
            className="w-28 rounded-md border border-neutral-700 bg-black/70 px-2 py-1 text-sm text-neutral-200 focus:border-red-600"
            aria-label="Filtrer par année"
          />

          <input
            type="number"
            step="0.5"
            min="0"
            max="10"
            value={ratingMin}
            onChange={(e) => {
              setPage(1)
              setRatingMin(e.target.value)
            }}
            placeholder="Note min"
            className="w-28 rounded-md border border-neutral-700 bg-black/70 px-2 py-1 text-sm text-neutral-200 focus:border-red-600"
            aria-label="Filtrer par note minimale"
          />

          <select
            value={sortBy}
            onChange={(e) => {
              setPage(1)
              setSortBy(e.target.value)
            }}
            className="select-bordered w-52 rounded-md border border-neutral-700 bg-black/70 px-2 py-1 text-sm text-neutral-200 focus:border-red-600"
            aria-label="Trier"
          >
            <option value="popularity.desc">Popularité décroissante</option>
            <option value="primary_release_date.desc">Date de sortie décroissante</option>
            <option value="vote_average.desc">Note décroissante</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setGenre('')
              setYear('')
              setRatingMin('')
              setSortBy('popularity.desc')
              setPage(1)
            }}
            className="inline-flex items-center rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-300 transition hover:border-red-600 hover:text-white"
          >
            Réinitialiser
          </button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonMovieCard key={index} />
            ))}
          </div>
        ) : (
          <MovieGrid
            movies={results}
            hideYear
            renderFooter={(movie) => {
              const d = movie.release_date || movie.first_air_date
              const year = d ? new Date(d).getFullYear() : '—'
              return (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">{year}</span>
                  <FavoriteButton movie={movie} isFavorite={favoriteIds.has(movie.id)} />
                </div>
              )
            }}
          />
        )}
      </section>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => !prevDisabled && setPage((p) => Math.max(1, p - 1))}
          disabled={prevDisabled}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm ${
            prevDisabled
              ? 'border border-neutral-700 text-neutral-500'
              : 'border border-neutral-600 text-neutral-200 hover:border-red-600 hover:text-white'
          }`}
        >
          Précédent
        </button>
        <span className="text-sm text-neutral-400">Page {currentPage} / {totalPages}</span>
        <button
          type="button"
          onClick={() => !nextDisabled && setPage((p) => p + 1)}
          disabled={nextDisabled}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm ${
            nextDisabled
              ? 'border border-neutral-700 text-neutral-500'
              : 'border border-neutral-600 text-neutral-200 hover:border-red-600 hover:text-white'
          }`}
        >
          Suivant
        </button>
      </div>
    </section>
  )
}

export default Films
