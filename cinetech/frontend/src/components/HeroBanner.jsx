// Bandeau héro avec image de fond et CTA
import { Link } from 'react-router-dom'
const backdropBase = 'https://image.tmdb.org/t/p/original'

// Affiche le film mis en avant (titre, méta, résumé, actions)
function HeroBanner({ movie }) {
  const backdropUrl = movie?.backdrop_path ? `${backdropBase}${movie.backdrop_path}` : null
  const year = movie?.release_date ? new Date(movie.release_date).getFullYear() : null
  const runtime = movie?.runtime ? `${movie.runtime} min` : null
  const rating = movie?.vote_average ? `${movie.vote_average.toFixed(1)}/10` : null
  // Fallback pour le slug si absent
  const slug = movie?.slug || (movie?.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

  return (
    <section className="relative h-[75vh] min-h-[420px] w-full overflow-hidden bg-black">
      {backdropUrl ? (
        <div
          className="pointer-events-none absolute inset-0 bg-no-repeat bg-contain sm:bg-cover sm:bg-center sm:scale-105 opacity-80"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-900 to-black" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,_rgba(0,0,0,0.9),_rgba(0,0,0,0)_70%)]" />
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 sm:px-10 lg:px-16">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
            CinéTech Original
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
            {movie?.title || 'Titre du film en avant' }
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-200">
            {year ? <span>{year}</span> : null}
            {runtime ? <span>{runtime}</span> : null}
            {rating ? <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[0.65rem] font-semibold">{rating}</span> : null}
            <span className="rounded-sm border border-neutral-500 px-1.5 py-0.5 text-[0.65rem]">10+</span>
          </div>
          <p className="line-clamp-3 text-sm text-neutral-200">
            {movie?.overview ||
              "Résumé du film mis en avant. Cette zone permet de présenter brièvement l’histoire comme sur Netflix."}
          </p>
          <div className="mt-3 flex items-center gap-3">
            {movie?.id ? (
              <Link
                to={slug ? `/films/${slug}` : `/movie/${movie.id}`}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
                aria-label="Lecture du film"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                <span>Lecture</span>
              </Link>
            ) : null}
            {movie?.id ? (
              <Link
                to={slug ? `/films/${slug}` : `/movie/${movie.id}`}
                className="inline-flex items-center gap-2 rounded-md border border-neutral-600 bg-black/60 px-4 py-2 text-sm font-semibold text-neutral-200 transition hover:border-red-600 hover:text-white"
                aria-label="Plus d’infos"
              >
                <span className="material-symbols-outlined">info</span>
                <span>Plus d’infos</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
