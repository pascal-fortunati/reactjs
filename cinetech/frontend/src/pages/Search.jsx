// Page Recherche: multi, films, séries + ranking et modes précision
import { useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchMulti, searchMovies, searchSeries } from '../services/api'
import MovieGrid from '../components/MovieGrid'
import SkeletonMovieCard from '../components/SkeletonMovieCard'

// Gère le type (all/movie/tv) et la précision (strict/broad)
function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [type, setType] = useState('all')
  const [precision, setPrecision] = useState('strict')

  const { data: multi, isLoading: loadingMulti, isError: errorMulti } = useQuery({
    queryKey: ['search-multi', q],
    queryFn: () => searchMulti(q),
    enabled: q.length > 0,
  })

  const { data: movies, isLoading: loadingMovies, isError: errorMovies } = useQuery({
    queryKey: ['search-movies', q],
    queryFn: () => searchMovies(q),
    enabled: q.length > 0,
  })

  const { data: series, isLoading: loadingSeries, isError: errorSeries } = useQuery({
    queryKey: ['search-series', q],
    queryFn: () => searchSeries(q),
    enabled: q.length > 0,
  })

  const multiAll = useMemo(
    () => (multi?.results ?? []).filter((item) => (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path),
    [multi],
  )
  const moviesMulti = useMemo(() => multiAll.filter((i) => i.media_type === 'movie'), [multiAll])
  const seriesMulti = useMemo(() => multiAll.filter((i) => i.media_type === 'tv'), [multiAll])

  const moviesResults = useMemo(() => {
    const fallback = (movies?.results ?? []).filter((m) => !!m.poster_path)
    return moviesMulti.length > 0 ? moviesMulti : fallback
  }, [moviesMulti, movies])

  const seriesResults = useMemo(() => {
    const fallback = (series?.results ?? []).filter((s) => !!s.poster_path)
    return seriesMulti.length > 0 ? seriesMulti : fallback
  }, [seriesMulti, series])

  const combined = useMemo(() => [...moviesResults, ...seriesResults], [moviesResults, seriesResults])

  // Normalise une chaîne pour comparaison (minuscules, sans accents)
  const normalized = useCallback((s) => (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim(), [])

  const titleOf = (item) => item.title || item.name || item.original_title || item.original_name || ''

  // Vérifie si le terme correspond à une frontière de mot
  const boundaryMatch = useCallback((text, term) => {
    try {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`(^|\\W)${esc}(\\W|$)`, 'i')
      return re.test(text)
    } catch {
      return false
    }
  }, [])

  // Extrait une année potentielle du texte de recherche
  const extractYear = useCallback((s) => {
    const m = (s || '').match(/(?:^|\D)(19\d{2}|20\d{2})(?:\D|$)/)
    return m ? Number(m[1]) : null
  }, [])

  // Scoring des éléments: exact, prefix, boundary, contain + bonus année
  const scoreItem = useCallback((item, query) => {
    const t = normalized(titleOf(item))
    const nq = normalized(query)
    if (!nq) return 0
    let score = 0
    if (t === nq) score = 100
    else if (t.startsWith(nq)) score = 85
    else if (boundaryMatch(t, nq)) score = 75
    else if (t.includes(nq)) score = 60
    const yq = extractYear(query)
    const y = Number((item.release_date || item.first_air_date || '').slice(0, 4)) || null
    if (yq && y && yq === y) score += 10
    return score
  }, [normalized, boundaryMatch, extractYear])

  // Filtrage strict: le titre doit commencer par le terme
  const strictAccept = useCallback((item, query) => {
    const t = normalized(titleOf(item))
    const nq = normalized(query)
    if (!nq) return true
    try {
      const esc = nq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(`^${esc}(\\W|$)`) // doit commencer par le terme
      return re.test(t)
    } catch {
      return false
    }
  }, [normalized])

  // Classe la liste selon score et critères de tri secondaires
  const rankList = useCallback((list, query) => {
    const filtered = precision === 'strict' ? list.filter((item) => strictAccept(item, query)) : list
    const threshold = precision === 'strict' ? 75 : 0
    return filtered
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter((x) => x.score >= threshold)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        const va = Number(a.item.vote_average || 0)
        const vb = Number(b.item.vote_average || 0)
        if (vb !== va) return vb - va
        const pa = Number(a.item.popularity || 0)
        const pb = Number(b.item.popularity || 0)
        return pb - pa
      })
      .map((x) => x.item)
  }, [precision, scoreItem, strictAccept])

  const isLoadingAll = loadingMulti || loadingMovies || loadingSeries

  const isErrorAll = errorMulti && errorMovies && errorSeries

  const baseList = type === 'movie' ? moviesResults : type === 'tv' ? seriesResults : combined
  const currentList = useMemo(() => rankList(baseList, q), [baseList, q, rankList])

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold text-white">Recherche</h2>
      </div>

      {q.length === 0 ? (
        <p className="text-sm text-neutral-400">Saisissez un terme pour rechercher des films ou des séries.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-100">Résultats pour "{q}"</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setType('all')}
                className={`inline-flex items-center rounded-md px-3 py-1 text-sm ${type === 'all' ? 'bg-red-600 text-white' : 'border border-neutral-700 text-neutral-300 hover:border-red-600 hover:text-white'}`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setType('movie')}
                className={`inline-flex items-center rounded-md px-3 py-1 text-sm ${type === 'movie' ? 'bg-red-600 text-white' : 'border border-neutral-700 text-neutral-300 hover:border-red-600 hover:text-white'}`}
              >
                Films
              </button>
              <button
                type="button"
                onClick={() => setType('tv')}
                className={`inline-flex items-center rounded-md px-3 py-1 text-sm ${type === 'tv' ? 'bg-red-600 text-white' : 'border border-neutral-700 text-neutral-300 hover:border-red-600 hover:text-white'}`}
              >
                Séries
              </button>
              <span className="mx-2 h-5 w-px bg-neutral-700" />
              <button
                type="button"
                onClick={() => setPrecision('strict')}
                className={`inline-flex items-center rounded-md px-3 py-1 text-sm ${precision === 'strict' ? 'bg-neutral-800 text-white border border-neutral-700' : 'border border-neutral-700 text-neutral-300 hover:border-red-600 hover:text-white'}`}
                aria-pressed={precision === 'strict'}
                aria-label="Recherche précise"
              >
                Précise
              </button>
              <button
                type="button"
                onClick={() => setPrecision('broad')}
                className={`inline-flex items-center rounded-md px-3 py-1 text-sm ${precision === 'broad' ? 'bg-neutral-800 text-white border border-neutral-700' : 'border border-neutral-700 text-neutral-300 hover:border-red-600 hover:text-white'}`}
                aria-pressed={precision === 'broad'}
                aria-label="Recherche large"
              >
                Large
              </button>
            </div>
          </div>

          {isLoadingAll ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <SkeletonMovieCard key={index} />
              ))}
            </div>
          ) : isErrorAll ? (
            <p className="text-sm text-red-500">Impossible de charger les résultats de recherche.</p>
          ) : (
            <MovieGrid movies={currentList} />
          )}
        </>
      )}
    </section>
  )
}

export default Search
