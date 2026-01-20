/**
 * Route de recherche multi TMDB
 * - Recherche simultanée films, séries, personnes
 */
const express = require('express')
const axios = require('axios')

const router = express.Router()

const tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const apiKey = process.env.TMDB_API_KEY

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

// Récupère les résultats d'une recherche multimédia en fonction d'un terme de recherche
router.get('/', async (req, res, next) => {
  try {
    const query = req.query.query
    if (!query) {
      return res.status(400).json({ message: 'Paramètre query requis' })
    }
    const client = createTmdbClient()
    const response = await client.get('/search/multi', {
      params: {
        query,
        include_adult: false,
      },
    })
    res.json(response.data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
