const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '.env') })

require('./db')
const moviesRouter = require('./routes/movies')
const tvRouter = require('./routes/tv')
const favoritesRouter = require('./routes/favorites')
const searchRouter = require('./routes/search')
const swaggerSpec = require('./swagger')

const app = express()

app.use(cors())
app.use(express.json())

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
    customCss:
      '.swagger-ui section.models{display:none!important} :root{color-scheme: light} @media (prefers-color-scheme: dark){:root{color-scheme: light}}',
    customJs: '/swagger-custom.js',
  }),
)

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

app.get('/', (req, res) => {
  res.redirect('/api-docs')
})

app.use('/api/movies', moviesRouter)
app.use('/api/tv', tvRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/search', searchRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' })
})

app.use((err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Erreur serveur'
  res.status(status).json({ message })
})

const port = process.env.PORT || 3001

app.listen(port, () => {})
