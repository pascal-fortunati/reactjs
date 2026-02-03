import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPopularMovies, getFavorites, getPopularSeries } from '../services/api'
import TrendingCarousel from '../components/TrendingCarousel'
import MovieGrid from '../components/MovieGrid'
import SkeletonMovieCard from '../components/SkeletonMovieCard'
import HeroBanner from '../components/HeroBanner'
import FavoriteButton from '../components/FavoriteButton'

function Home() {

  const {
    data: popularMovies,
    isLoading: isLoadingPopularMovies,
    isError: isErrorPopularMovies,
  } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => getPopularMovies(),
  })


  const {
    data: popularSeries,
    isLoading: isLoadingPopularSeries,
    isError: isErrorPopularSeries,
  } = useQuery({
    queryKey: ['popular-series'],
    queryFn: () => getPopularSeries(),
  })

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => getFavorites(),
  })


  const popularMovieResults = useMemo(() => (popularMovies?.results ?? []).slice(0, 10), [popularMovies])
  
  const popularSeriesResults = useMemo(() => (popularSeries?.results ?? []).slice(0, 10), [popularSeries])
  const favoriteIds = new Set((favorites ?? []).map((f) => f.movie_id))

  const [featuredIndex, setFeaturedIndex] = useState(0)
  const featuredMovie = popularMovieResults[featuredIndex]

  useEffect(() => {
    if (popularMovieResults.length === 0) return
    const timer = window.setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % popularMovieResults.length)
    }, 8000)
    return () => {
      window.clearInterval(timer)
    }
  }, [popularMovieResults])

  const renderFooter = (movie) => {
    const d = movie.release_date || movie.first_air_date
    const year = d ? new Date(d).getFullYear() : '—'
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-400">{year}</span>
        <FavoriteButton movie={movie} isFavorite={favoriteIds.has(movie.id)} />
      </div>
    )
  }

  return (
    <section className="space-y-8">
      <div className="-mx-6">
        <HeroBanner movie={featuredMovie} />
      </div>

        <TrendingCarousel
        title="Films populaires"
        movies={popularMovieResults}
        isLoading={isLoadingPopularMovies}
        renderFooter={renderFooter}
          hideYear
        onHighlight={(movie) => {
          const idx = popularMovieResults.findIndex((m) => m.id === movie.id)
          if (idx >= 0) setFeaturedIndex(idx)
        }}
      />

      
      {isErrorPopularSeries ? (
        <p className="text-sm text-red-500">Impossible de charger les séries populaires.</p>
      ) : (
        <TrendingCarousel title="Séries populaires" movies={popularSeriesResults} isLoading={isLoadingPopularSeries} renderFooter={renderFooter} hideYear />
      )}
      {isErrorPopularMovies ? (
        <p className="text-sm text-red-500">Impossible de charger les films populaires.</p>
      ) : null}
    </section>
  )
}

export default Home
