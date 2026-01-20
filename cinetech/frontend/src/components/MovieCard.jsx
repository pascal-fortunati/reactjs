// Carte film/série avec hover actions et modale bande-annonce
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import YouTubePlayer from './YouTubePlayer'
import { getMovieDetails, getSeriesDetails } from '../services/api'

const imageBase = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500/'

// Affiche image, titre, année, note et actions
function MovieCard({ movie, footer, hideYear = false, rank }) {
  const title = movie.title || movie.name || '—'
  const releaseDate = movie.release_date || movie.first_air_date || null
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '—'
  const posterUrl = movie.poster_path ? `${imageBase}${movie.poster_path}` : null
  const isNew = (() => {
    if (!releaseDate) return false
    const release = new Date(releaseDate)
    const now = new Date()
    const diffDays = Math.floor((now - release) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 30
  })()
  const slug = movie.slug || title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const detailsPath = movie.title ? `/films/${slug}` : `/series/${slug}`
  const navigate = useNavigate()
  const [openTrailer, setOpenTrailer] = useState(false)
  const [trailerKey, setTrailerKey] = useState(null)
  const [loadingTrailer, setLoadingTrailer] = useState(false)
  const [errorTrailer, setErrorTrailer] = useState(false)

  // Ferme la modale trailer via touche Échap
  useEffect(() => {
    if (!openTrailer) return
    const handler = (e) => {
      if (e.key === 'Escape') setOpenTrailer(false)
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [openTrailer])

  // Ouvre la modale et récupère la meilleure vidéo YouTube
  const openAndFetchTrailer = async () => {
    setOpenTrailer(true)
    setLoadingTrailer(true)
    setErrorTrailer(false)
    try {
      const details = movie.title ? await getMovieDetails(movie.id) : await getSeriesDetails(movie.id)
      const videos = details?.videos?.results || []
      const yt = videos.filter((v) => v.site === 'YouTube')
      const best = yt.find((v) => v.type === 'Trailer') || yt.find((v) => v.type === 'Teaser') || yt[0]
      setTrailerKey(best ? best.key : null)
    } catch {
      setErrorTrailer(true)
      setTrailerKey(null)
    } finally {
      setLoadingTrailer(false)
    }
  }

  return (
    <article className="group/card h-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-950/80 shadow-md transition-transform duration-200 hover:border-red-600 hover:shadow-xl">
      <Link to={detailsPath} className="flex h-full flex-col">
        <figure className="relative z-0 aspect-[2/3] overflow-hidden bg-neutral-900">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-sm">
              Affiche indisponible
            </div>
          )}
        
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-yellow-400">
            <span className="material-symbols-outlined text-[18px] leading-none text-yellow-400">star</span>
            <span>{rating}</span>
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center bg-black/30 backdrop-blur-sm group-hover/card:flex">
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                type="button"
                aria-label="Lecture"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  openAndFetchTrailer()
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <span className="material-symbols-outlined text-[22px] leading-none">play_arrow</span>
              </button>
              <button
                type="button"
                aria-label="Plus d’infos"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(detailsPath)
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-600 bg-black/80 text-white shadow transition hover:border-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <span className="material-symbols-outlined text-[22px] leading-none">info</span>
              </button>
            </div>
          </div>
          {isNew ? (
            <div className="absolute bottom-2 left-2 rounded-md bg-red-600/90 px-2 py-1 text-[0.7rem] font-bold text-white shadow">
              Ajout récent
            </div>
          ) : null}
          {typeof rank === 'number' ? (
            <div className="pointer-events-none absolute top-2 right-2 z-10 select-none text-[72px] font-black leading-none text-red-700/90 sm:text-[84px] md:text-[96px]">
              {rank}
            </div>
          ) : null}
        </figure>
        <div className="flex flex-1 flex-col gap-1 px-2 pb-2 pt-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-50">{title}</h3>
          {hideYear ? null : <p className="text-xs text-neutral-400">{year}</p>}
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
      </Link>
      {openTrailer ? (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpenTrailer(false)} />
          <div className="absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-6">
            <div className="rounded-xl border border-neutral-700 bg-neutral-900/95 p-3 shadow-2xl">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-200">Bande-annonce • {title}</h4>
                <button type="button" aria-label="Fermer" onClick={() => setOpenTrailer(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-300 transition hover:bg-neutral-800 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {loadingTrailer ? (
                <div className="aspect-video rounded-lg bg-neutral-800" />
              ) : errorTrailer ? (
                <div className="aspect-video flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-sm text-red-500">Impossible de charger la bande-annonce.</div>
              ) : trailerKey ? (
                <YouTubePlayer videoId={trailerKey} autoPlay={true} />
              ) : (
                <div className="aspect-video flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-sm text-neutral-300">Aucune bande-annonce disponible.</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default MovieCard