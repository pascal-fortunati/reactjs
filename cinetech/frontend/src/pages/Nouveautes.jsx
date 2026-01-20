// Page Nouveautés: contenus sortis dans les 30 derniers jours
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { discoverMovies, discoverSeries, getPopularMovies, getPopularSeries } from '../services/api'
import MovieGrid from '../components/MovieGrid'
import SkeletonMovieCard from '../components/SkeletonMovieCard'

// Combine Discover et fallback sur Popular si Discover vide
function Nouveautes() {
  const todayDate = useMemo(() => {
    const d = new Date()
    return d.toISOString().slice(0, 10)
  }, [])

  // Nouveaux films (Discover entre gte et today)
  const { data: recentMovies, isLoading: loadingMovies } = useQuery({
    queryKey: ['movies-new', todayDate],
    queryFn: async () => {
      const thirtyAgo = new Date()
      thirtyAgo.setDate(thirtyAgo.getDate() - 30)
      const gte = thirtyAgo.toISOString().slice(0, 10)

      const discovered = await discoverMovies({
        sort_by: 'primary_release_date.desc',
        primary_release_date_gte: gte,
        primary_release_date_lte: todayDate,
      })

      const filteredDiscover = (discovered?.results ?? []).filter((m) => {
        if (!m.poster_path) return false
        const d = m.release_date
        if (!d) return false
        const release = new Date(d)
        const now = new Date()
        const diffDays = Math.floor((now - release) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 30
      })

      if (filteredDiscover.length) {
        return { ...discovered, results: filteredDiscover }
      }

      const trending = await getPopularMovies()
      const filteredTrending = (trending?.results ?? []).filter((m) => {
        if (!m.poster_path) return false
        const d = m.release_date
        if (!d) return false
        const release = new Date(d)
        const now = new Date()
        const diffDays = Math.floor((now - release) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 30
      })

      return { page: 1, total_pages: 1, total_results: filteredTrending.length, results: filteredTrending }
    },
  })

  // Nouvelles séries (Discover entre gte et today)
  const { data: recentSeries, isLoading: loadingSeries } = useQuery({
    queryKey: ['series-new', todayDate],
    queryFn: async () => {
      const thirtyAgo = new Date()
      thirtyAgo.setDate(thirtyAgo.getDate() - 30)
      const gte = thirtyAgo.toISOString().slice(0, 10)

      const discovered = await discoverSeries({
        sort_by: 'first_air_date.desc',
        first_air_date_gte: gte,
        first_air_date_lte: todayDate,
      })

      const filteredDiscover = (discovered?.results ?? []).filter((s) => {
        if (!s.poster_path) return false
        const d = s.first_air_date
        if (!d) return false
        const release = new Date(d)
        const now = new Date()
        const diffDays = Math.floor((now - release) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 30
      })

      if (filteredDiscover.length) {
        return { ...discovered, results: filteredDiscover }
      }

      const trending = await getPopularSeries()
      const filteredTrending = (trending?.results ?? []).filter((s) => {
        if (!s.poster_path) return false
        const d = s.first_air_date
        if (!d) return false
        const release = new Date(d)
        const now = new Date()
        const diffDays = Math.floor((now - release) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 30
      })

      return { page: 1, total_pages: 1, total_results: filteredTrending.length, results: filteredTrending }
    },
  })

  const recentMoviesResults = recentMovies?.results ?? []

  const recentSeriesResults = recentSeries?.results ?? []

  return (
    <section className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white">Nouveautés Films</h2>
        </div>
        {loadingMovies ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonMovieCard key={index} />
            ))}
          </div>
        ) : (
          <MovieGrid movies={recentMoviesResults} />
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold text-white">Nouveautés Séries</h2>
        </div>
        {loadingSeries ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonMovieCard key={index} />
            ))}
          </div>
        ) : (
          <MovieGrid movies={recentSeriesResults} />
        )}
      </section>
    </section>
  )
}

export default Nouveautes
