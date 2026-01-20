/**
 * Routes Films (TMDB)
 * - Recherche, populaires, découverte avec filtres
 * - Détails par ID et par slug
 * - Génération de slugs et cache mémoire simple (TTL)
 */
const express = require('express')
const axios = require('axios')

const router = express.Router()

// Configuration TMDB et cache en mémoire
const tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const apiKey = process.env.TMDB_API_KEY
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 300000)
const slugCache = new Map()

// Crée un client Axios configuré pour interagir avec l'API TMDB
function createTmdbClient() {
  const client = axios.create({
    baseURL: tmdbBaseUrl,
    params: {
      api_key: apiKey,
      language: 'fr-FR',
    },
  })
  return client
}

// Génère un slug à partir d'une chaîne de caractères
function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Récupère les données d'une clé de cache si elles sont disponibles et non expirées
function getCached(key) {
  const entry = slugCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    slugCache.delete(key)
    return null
  }
  return entry.data
}

// Met en cache une réponse avec horodatage
function setCached(key, data) {
  slugCache.set(key, { ts: Date.now(), data })
}

// Récupère les résultats d'une recherche de film en fonction d'un terme de recherche
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.query
    if (!query) {
      return res.status(400).json({ message: 'Paramètre query requis' })
    }
    const client = createTmdbClient()
    const response = await client.get('/search/movie', {
      params: {
        query,
        include_adult: false,
      },
    })
    const results = Array.isArray(response.data.results) ? response.data.results : []
    const withSlugs = results.map((m) => ({ ...m, slug: slugify(m.title) }))
    res.json({ ...response.data, results: withSlugs })
  } catch (error) {
    next(error)
  }
})

// Récupère les films populaires
router.get('/popular', async (req, res, next) => {
  try {
    const client = createTmdbClient()
    const response = await client.get('/movie/popular')
    const results = Array.isArray(response.data.results) ? response.data.results : []
    const withSlugs = results.map((m) => ({ ...m, slug: slugify(m.title) }))
    res.json({ ...response.data, results: withSlugs })
  } catch (error) {
    next(error)
  }
})

// Récupère les films disponibles en fonction de critères de filtrage
router.get('/discover', async (req, res, next) => {
  try {
    const client = createTmdbClient()
    const { with_genres, year, sort_by, vote_average_gte, page, primary_release_date_gte, primary_release_date_lte } = req.query

    const params = {}
    if (with_genres) params.with_genres = with_genres
    if (year) params.primary_release_year = year
    if (sort_by) params.sort_by = sort_by
    if (vote_average_gte) params['vote_average.gte'] = vote_average_gte
    if (page) params.page = page
    if (primary_release_date_gte) params['primary_release_date.gte'] = primary_release_date_gte
    if (primary_release_date_lte) params['primary_release_date.lte'] = primary_release_date_lte
    params.include_adult = false

    const response = await client.get('/discover/movie', { params })
    const results = Array.isArray(response.data.results) ? response.data.results : []
    const withSlugs = results.map((m) => ({ ...m, slug: slugify(m.title) }))
    res.json({ ...response.data, results: withSlugs })
  } catch (error) {
    next(error)
  }
})

// Récupère les détails d'un film en fonction de son slug avec leurs slugs
router.get('/by-slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    if (!slug) {
      return res.status(400).json({ message: 'Slug requis' })
    }
    const cacheKey = `movie:${slug}`
    const cached = getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }
    const client = createTmdbClient()
    const q = slug.replace(/-/g, ' ')
    const search = await client.get('/search/movie', {
      params: { query: q, include_adult: false },
    })
    const list = Array.isArray(search.data.results) ? search.data.results : []
    const match = list.find((m) => slugify(m.title) === slug) || list[0]
    if (!match || !match.id) {
      return res.status(404).json({ message: 'Film introuvable' })
    }
    const details = await client.get(`/movie/${match.id}`, {
      params: { append_to_response: 'videos,credits' },
    })
    setCached(cacheKey, details.data)
    res.json(details.data)
  } catch (error) {
    next(error)
  }
})

// Récupère les détails d'un film en fonction de son ID avec leurs slugs
router.get('/:id', async (req, res, next) => {
  try {
    const client = createTmdbClient()
    const { id } = req.params
    const response = await client.get(`/movie/${id}`, {
      params: {
        append_to_response: 'videos,credits',
      },
    })
    res.json(response.data)
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Film introuvable' })
    }
    next(error)
  }
})

module.exports = router
