/**
 * Routes Séries (TMDB)
 * - Populaires, découverte avec filtres, recherche
 * - Détails par ID et par slug
 * - Cache mémoire simple pour éviter des requêtes répétées
 */
const express = require('express')
const axios = require('axios')

const router = express.Router()

// Configuration TMDB et cache en mémoire
const tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const apiKey = process.env.TMDB_API_KEY
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 300000)
const slugCache = new Map()

// Crée un client TMDB avec les paramètres par défaut
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

// Récupère les données d'une clé de cache si elles sont valides
function getCached(key) {
  const entry = slugCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    slugCache.delete(key)
    return null
  }
  return entry.data
}

// Stocke les données dans le cache avec une clé unique
function setCached(key, data) {
  slugCache.set(key, { ts: Date.now(), data })
}

// Récupère les séries populaires avec leurs slugs
router.get('/popular', async (req, res, next) => {
  try {
    const client = createTmdbClient()
    const response = await client.get('/tv/popular')
    const results = Array.isArray(response.data.results) ? response.data.results : []
    const withSlugs = results.map((s) => ({ ...s, slug: slugify(s.name) }))
    res.json({ ...response.data, results: withSlugs })
  } catch (error) {
    next(error)
  }
})

// Récupère les séries en fonction de critères de découverte avec leurs slugs
router.get('/discover', async (req, res, next) => {
  try {
    const client = createTmdbClient()
    const { with_genres, year, sort_by, vote_average_gte, page, first_air_date_gte, first_air_date_lte } = req.query

    const params = {}
    if (with_genres) params.with_genres = with_genres
    if (year) params.first_air_date_year = year
    if (sort_by) params.sort_by = sort_by
    if (vote_average_gte) params['vote_average.gte'] = vote_average_gte
    if (page) params.page = page
    if (first_air_date_gte) params['first_air_date.gte'] = first_air_date_gte
    if (first_air_date_lte) params['first_air_date.lte'] = first_air_date_lte
    params.include_null_first_air_dates = false

    const response = await client.get('/discover/tv', { params })
    const results = Array.isArray(response.data.results) ? response.data.results : []
    const withSlugs = results.map((s) => ({ ...s, slug: slugify(s.name) }))
    res.json({ ...response.data, results: withSlugs })
  } catch (error) {
    next(error)
  }
})

// Récupère les séries en fonction d'une recherche avec leurs slugs
router.get('/search', async (req, res, next) => {
  try {
    const query = req.query.query
    if (!query) {
      return res.status(400).json({ message: 'Paramètre query requis' })
    }
    const client = createTmdbClient()
    const response = await client.get('/search/tv', {
      params: {
        query,
        include_adult: false,
      },
    })
    const results = Array.isArray(response.data.results) ? response.data.results : []
    const withSlugs = results.map((s) => ({ ...s, slug: slugify(s.name) }))
    res.json({ ...response.data, results: withSlugs })
  } catch (error) {
    next(error)
  }
})

// Récupère les détails d'une série en fonction de son ID avec leurs slugs
router.get('/:id', async (req, res, next) => {
  try {
    const client = createTmdbClient()
    const { id } = req.params
    const response = await client.get(`/tv/${id}`, {
      params: {
        append_to_response: 'videos,credits',
      },
    })
    res.json(response.data)
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'Série introuvable' })
    }
    next(error)
  }
})

// Récupère les détails d'une série en fonction de son slug avec leurs slugs
router.get('/by-slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params
    if (!slug) {
      return res.status(400).json({ message: 'Slug requis' })
    }
    const cacheKey = `tv:${slug}`
    const cached = getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }
    const client = createTmdbClient()
    const q = slug.replace(/-/g, ' ')
    const search = await client.get('/search/tv', {
      params: { query: q },
    })
    const list = Array.isArray(search.data.results) ? search.data.results : []
    const match = list.find((s) => slugify(s.name) === slug) || list[0]
    if (!match || !match.id) {
      return res.status(404).json({ message: 'Série introuvable' })
    }
    const details = await client.get(`/tv/${match.id}`, {
      params: { append_to_response: 'videos,credits' },
    })
    setCached(cacheKey, details.data)
    res.json(details.data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
