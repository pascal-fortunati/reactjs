// Grille responsive de cartes de films/séries
import MovieCard from './MovieCard'

// Affiche une grille avec options de footer et affichage année
function MovieGrid({ movies, renderFooter, hideYear = false }) {
  if (!movies || movies.length === 0) {
    return <p className="text-sm text-neutral-400">Aucun film à afficher.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          footer={renderFooter ? renderFooter(movie) : null}
          hideYear={hideYear}
        />
      ))}
    </div>
  )
}

export default MovieGrid
