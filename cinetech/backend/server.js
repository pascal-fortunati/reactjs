/**
 * Serveur Express de la Cinéthèque
 * - Chargement des variables d'environnement
 * - Initialisation de la base SQLite
 * - Configuration CORS et parsing JSON
 * - Exposition de la documentation Swagger UI
 * - Montage des routes API (films, séries, favoris, recherche)
 * - Gestion des erreurs et 404
 */
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const path = require('path')

// Charge les variables d'environnement depuis backend/.env
dotenv.config({ path: path.join(__dirname, '.env') })

// Initialise la base SQLite et prépare la table des favoris
require('./db')
const moviesRouter = require('./routes/movies')
const tvRouter = require('./routes/tv')
const favoritesRouter = require('./routes/favorites')
const searchRouter = require('./routes/search')
const swaggerSpec = require('./swagger')

// Création de l'application Express
const app = express()

// Active CORS pour autoriser le frontend à consommer l'API
app.use(cors())
// Parse automatiquement le corps JSON des requêtes
app.use(express.json())

// Swagger UI: documentation interactive de l'API REST
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      // Cache le panneau des modèles pour épurer l'interface
      defaultModelsExpandDepth: -1,
    },
    customCss:
      '.swagger-ui section.models{display:none!important} :root{color-scheme: light} @media (prefers-color-scheme: dark){:root{color-scheme: light}}',
    // Script client pour forcer le thème clair
    customJs: '/swagger-custom.js',
  }),
)

// Force le thème "light" pour Swagger afin d'assurer la cohérence visuelle
app.get('/swagger-custom.js', (req, res) => {
  res.type('application/javascript').send(
    [
      'window.addEventListener("load",function(){',
      '  try {',
      '    var root = document.documentElement;',
      '    if(root){ root.setAttribute("data-theme","light"); root.style.colorScheme = "light"; }',
      '    try{ localStorage.setItem("swagger-theme","light"); }catch(e){}',
      '    try{ localStorage.setItem("swagger_ui_theme","light"); }catch(e){}',
      '    try{ localStorage.setItem("theme","light"); }catch(e){}',
      '    setTimeout(function(){',
      '      var btn = document.querySelector("[aria-label=\"Switch to light theme\"]");',
      '      if(btn){ btn.click(); }',
      '    }, 300);',
      '  } catch(e) {}',
      '});',
    ].join(''),
  )
})

// Redirige la racine vers la documentation
app.get('/', (req, res) => {
  res.redirect('/api-docs')
})

// Montage des routes API
app.use('/api/movies', moviesRouter)
app.use('/api/tv', tvRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/search', searchRouter)

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' })
})

// Gestion d'erreur globale
app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Erreur serveur'
  res.status(status).json({ message })
})

// Définition du port (par défaut 3001)
const port = process.env.PORT || 3001

// Démarre le serveur HTTP
app.listen(port, () => {})
