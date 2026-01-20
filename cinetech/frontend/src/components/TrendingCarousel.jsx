// Carousel horizontal pour les éléments tendance
import { useRef } from 'react'
import MovieCard from './MovieCard'
import SkeletonMovieCard from './SkeletonMovieCard'

// Affiche des cartes défilables avec boutons de navigation
function TrendingCarousel({ movies, isLoading, renderFooter, title = 'Films tendances', onHighlight, hideYear = false }) {
  const containerRef = useRef(null)

  const scrollLeft = () => {
    containerRef.current?.scrollBy({ left: -600, behavior: 'smooth' })
  }

  const scrollRight = () => {
    containerRef.current?.scrollBy({ left: 600, behavior: 'smooth' })
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="group/carousel relative">
        <div ref={containerRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="w-36 flex-shrink-0 sm:w-48 md:w-56">
                <SkeletonMovieCard />
              </div>
            ))
            : movies?.map((movie, idx) => (
              <div
                key={movie.id}
                className="relative w-36 flex-shrink-0 overflow-visible sm:w-48 md:w-56"
                onMouseEnter={() => onHighlight && onHighlight(movie)}
                onFocus={() => onHighlight && onHighlight(movie)}
                tabIndex={0}
              >
                <MovieCard movie={movie} footer={renderFooter ? renderFooter(movie) : null} hideYear={hideYear} rank={idx < 10 ? idx + 1 : undefined} />
              </div>
            ))}
        </div>
        <button type="button" onClick={scrollLeft} aria-label="Précédent" className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-r bg-black/60 px-2 py-2 text-white backdrop-blur transition group-hover/carousel:block hover:bg-black/80">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <button type="button" onClick={scrollRight} aria-label="Suivant" className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-l bg-black/60 px-2 py-2 text-white backdrop-blur transition group-hover/carousel:block hover:bg-black/80">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  )
}

export default TrendingCarousel
