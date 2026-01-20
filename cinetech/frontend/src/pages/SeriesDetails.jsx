// Détails série: synopsis, méta, casting, bande-annonce
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getSeriesDetails, getSeriesBySlug } from '../services/api'
import YouTubePlayer from '../components/YouTubePlayer'

// Charge par id ou slug et structure l’affichage
function SeriesDetails() {
  const { id, slug } = useParams()

  const { data: serie, isLoading, isError } = useQuery({
    queryKey: ['serie', id || slug],
    queryFn: async () => {
      if (id) return getSeriesDetails(id)
      if (slug) return getSeriesBySlug(slug)
      return null
    },
    enabled: Boolean(id || slug),
  })

  if (isLoading) {
    return <p className="text-sm text-neutral-300">Chargement de la série…</p>
  }

  if (isError || !serie) {
    return <p className="text-sm text-red-500">Impossible de charger cette série.</p>
  }

  const title = serie.name || '—'
  const year = serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : '—'
  const imageBase = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500/'
  const posterUrl = serie.poster_path ? `${imageBase}${serie.poster_path}` : null

  const trailer = serie.videos?.results?.find(
    (video) => video.site === 'YouTube' && video.type === 'Trailer',
  )

  const cast = serie.credits?.cast?.slice(0, 8) ?? []

  return (
    <section className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="space-y-4">
        {posterUrl ? (
          <img src={posterUrl} alt={title} className="w-full max-w-sm rounded-xl shadow-md md:max-w-full" />
        ) : null}
        <div className="space-y-1 text-sm text-neutral-300">
          <div><span className="font-semibold">Année :</span> {year}</div>
          {serie.number_of_seasons ? (
            <div><span className="font-semibold">Saisons :</span> {serie.number_of_seasons}</div>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-neutral-300">{serie.tagline}</p>
        </header>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Synopsis</h3>
          <p className="text-sm leading-relaxed text-neutral-200">{serie.overview}</p>
        </section>

        {cast.length > 0 ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Casting principal</h3>
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

export default SeriesDetails
