// Base URL de l'API backend (configurable via VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// Client léger pour effectuer les requêtes HTTP vers le backend
async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  // Gestion des erreurs HTTP
  if (!response.ok) {
    const message = `Erreur API ${response.status}`
    throw new Error(message)
  }

  // Réponse vide pour DELETE (204 No Content)
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Films: populaires
export function getPopularMovies() {
  return request('/api/movies/popular')
}

// Films: recherche
export function searchMovies(query) {
  const params = new URLSearchParams({ query })
  return request(`/api/movies/search?${params.toString()}`)
}

// Films: détails par ID
export function getMovieDetails(id) {
  return request(`/api/movies/${id}`)
}

// Films: détails par slug
export function getMovieBySlug(slug) {
  return request(`/api/movies/by-slug/${encodeURIComponent(slug)}`)
}

// Films: découverte avec filtres
export function discoverMovies(params) {
  const search = new URLSearchParams(params)
  return request(`/api/movies/discover?${search.toString()}`)
}

// Favoris: liste
export function getFavorites() {
  return request('/api/favorites')
}

// Favoris: ajout ou mise à jour
export function addFavorite(payload) {
  return request('/api/favorites', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Favoris: suppression par movieId
export function deleteFavorite(movieId) {
  return request(`/api/favorites/${movieId}`, {
    method: 'DELETE',
  })
}

// Séries: populaires
export function getPopularSeries() {
  return request('/api/tv/popular')
}

// Séries: détails par ID
export function getSeriesDetails(id) {
  return request(`/api/tv/${id}`)
}

// Séries: détails par slug
export function getSeriesBySlug(slug) {
  return request(`/api/tv/by-slug/${encodeURIComponent(slug)}`)
}

// Séries: découverte avec filtres
export function discoverSeries(params) {
  const search = new URLSearchParams(params)
  return request(`/api/tv/discover?${search.toString()}`)
}

// Séries: recherche
export function searchSeries(query) {
  const params = new URLSearchParams({ query })
  return request(`/api/tv/search?${params.toString()}`)
}

// Recherche multi: films + séries
export function searchMulti(query) {
  const params = new URLSearchParams({ query })
  return request(`/api/search?${params.toString()}`)
}

export default {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getMovieBySlug,
  discoverMovies,
  getFavorites,
  addFavorite,
  deleteFavorite,
  getPopularSeries,
  getSeriesDetails,
  getSeriesBySlug,
  discoverSeries,
  searchSeries,
  searchMulti,
}
