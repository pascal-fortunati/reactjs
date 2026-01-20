// Détails film: synopsis, méta, casting, bande-annonce
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMovieDetails, getMovieBySlug } from '../services/api'
import YouTubePlayer from '../components/YouTubePlayer'

// Charge par id ou slug et structure l’affichage
function MovieDetails() {
  const { id, slug } = useParams()

  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['movie', id || slug],
    queryFn: async () => {
      if (id) return getMovieDetails(id)
      if (slug) return getMovieBySlug(slug)
      return null
    },
    enabled: Boolean(id || slug),
  })

  if (isLoading) {
    return <p className="text-sm text-neutral-300">Chargement du film…</p>
  }

  if (isError || !movie) {
    return <p className="text-sm text-red-500">Impossible de charger ce film.</p>
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'
  const imageBase = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500/'
  const posterUrl = movie.poster_path ? `${imageBase}${movie.poster_path}` : null

  const trailer = movie.videos?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer',
  )

  const cast = movie.credits?.cast?.slice(0, 8) ?? []

  return (
    <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-4">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full max-w-sm rounded-xl shadow-md md:max-w-full"
          />
        ) : null}
        <div className="space-y-1 text-sm text-neutral-300">
          <div>
            <span className="font-semibold">Année :</span> {year}
          </div>
          <div>
            <span className="font-semibold">Note :</span> {rating} / 10
          </div>
          {movie.runtime ? (
            <div>
              <span className="font-semibold">Durée :</span> {movie.runtime} min
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">{movie.title}</h2>
          <p className="text-sm text-neutral-300">{movie.tagline}</p>
        </header>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Synopsis
          </h3>
          <p className="text-sm leading-relaxed text-neutral-200">{movie.overview}</p>
        </section>

        {cast.length > 0 ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              Casting principal
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {cast.map((person) => (
                <div key={person.id} className="rounded bg-neutral-800/60 p-2">
                  <p className="font-medium leading-tight">{person.name}</p>
                  <p className="text-xs text-neutral-400">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {trailer ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Bande-annonce</h3>
            <YouTubePlayer videoId={trailer.key} autoPlay={false} />
          </section>
        ) : null}
      </div>
    </section>
  )
}

export default MovieDetails
