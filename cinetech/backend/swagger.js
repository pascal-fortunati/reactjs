// Spécification OpenAPI 3 pour documenter l'API Cinéthèque
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Cinéthèque API',
    version: '1.0.0',
    description: 'API de cinéthèque basée sur TMDB et SQLite',
  },
  servers: [
    {
      url: 'http://localhost:3001',
    },
  ],
  components: {
    schemas: {
      Movie: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 603 },
          title: { type: 'string', example: 'Matrix' },
          slug: { type: 'string', example: 'matrix' },
          overview: { type: 'string' },
          poster_path: { type: 'string', nullable: true },
          vote_average: { type: 'number', format: 'float', example: 8.7 },
          release_date: { type: 'string', format: 'date', example: '1999-03-31' },
        },
      },
      Favorite: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          movie_id: { type: 'integer', example: 603 },
          title: { type: 'string' },
          poster_path: { type: 'string', nullable: true },
          vote_average: { type: 'number', format: 'float' },
          release_date: { type: 'string', format: 'date', nullable: true },
          added_at: { type: 'string', format: 'date-time' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/movies/popular': {
      get: {
        summary: 'Liste des films populaires',
        tags: ['Movies'],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movie' },
                    },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/tv/popular': {
      get: {
        summary: 'Liste des séries populaires',
        tags: ['TV'],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: { type: 'array', items: { $ref: '#/components/schemas/Movie' } },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tv/discover': {
      get: {
        summary: 'Découverte de séries avec filtres',
        tags: ['TV'],
        parameters: [
          { in: 'query', name: 'with_genres', schema: { type: 'string' }, description: 'Genres séparés par des virgules' },
          { in: 'query', name: 'year', schema: { type: 'integer' }, description: 'Année de première diffusion' },
          { in: 'query', name: 'sort_by', schema: { type: 'string' }, description: 'Critère de tri TMDB (ex: popularity.desc)' },
          { in: 'query', name: 'vote_average_gte', schema: { type: 'number', format: 'float' }, description: 'Note minimale' },
          { in: 'query', name: 'first_air_date_gte', schema: { type: 'string', format: 'date' }, description: 'Première diffusion à partir du (AAAA-MM-JJ)' },
          { in: 'query', name: 'first_air_date_lte', schema: { type: 'string', format: 'date' }, description: 'Première diffusion jusqu’au (AAAA-MM-JJ)' },
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 }, description: 'Numéro de page pour la pagination' },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: { type: 'array', items: { $ref: '#/components/schemas/Movie' } },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tv/{id}': {
      get: {
        summary: 'Détails d’une série',
        tags: ['TV'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } },
          },
          404: {
            description: 'Série introuvable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/tv/by-slug/{slug}': {
      get: {
        summary: 'Détails d’une série via slug',
        tags: ['TV'],
        parameters: [
          { in: 'path', name: 'slug', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Movie' } } },
          },
          404: {
            description: 'Série introuvable',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/tv/search': {
      get: {
        summary: 'Recherche de séries',
        tags: ['TV'],
        parameters: [
          {
            in: 'query',
            name: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Texte de recherche',
          },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movie' },
                    },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Paramètre manquant',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/movies/search': {
      get: {
        summary: 'Recherche de films',
        tags: ['Movies'],
        parameters: [
          {
            in: 'query',
            name: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Texte de recherche',
          },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movie' },
                    },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Paramètre manquant',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/search': {
      get: {
        summary: 'Recherche multi (films + séries)',
        tags: ['Search'],
        parameters: [
          {
            in: 'query',
            name: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Texte de recherche',
          },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movie' },
                    },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Paramètre manquant',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/movies/discover': {
      get: {
        summary: 'Découverte de films avec filtres',
        tags: ['Movies'],
        parameters: [
          {
            in: 'query',
            name: 'with_genres',
            schema: { type: 'string' },
            description: 'Liste d’identifiants de genres séparés par des virgules',
          },
          {
            in: 'query',
            name: 'year',
            schema: { type: 'integer' },
            description: 'Année de sortie',
          },
          {
            in: 'query',
            name: 'sort_by',
            schema: { type: 'string' },
            description: 'Critère de tri TMDB (ex: popularity.desc)',
          },
          {
            in: 'query',
            name: 'vote_average_gte',
            schema: { type: 'number', format: 'float' },
            description: 'Note minimale',
          },
          {
            in: 'query',
            name: 'primary_release_date_gte',
            schema: { type: 'string', format: 'date' },
            description: 'Sortie à partir du (AAAA-MM-JJ)',
          },
          {
            in: 'query',
            name: 'primary_release_date_lte',
            schema: { type: 'string', format: 'date' },
            description: 'Sortie jusqu’au (AAAA-MM-JJ)',
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1 },
            description: 'Numéro de page pour la pagination',
          },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    results: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Movie' },
                    },
                    total_pages: { type: 'integer' },
                    total_results: { type: 'integer' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/movies/{id}': {
      get: {
        summary: 'Détails d’un film',
        tags: ['Movies'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Movie' },
              },
            },
          },
          404: {
            description: 'Film introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/movies/by-slug/{slug}': {
      get: {
        summary: 'Détails d’un film via slug',
        tags: ['Movies'],
        parameters: [
          {
            in: 'path',
            name: 'slug',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Movie' },
              },
            },
          },
          404: {
            description: 'Film introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/favorites': {
      get: {
        summary: 'Liste des favoris sauvegardés en base',
        tags: ['Favorites'],
        responses: {
          200: {
            description: 'Succès',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Favorite' },
                },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Ajoute ou remplace un favori',
        tags: ['Favorites'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  movie_id: { type: 'integer' },
                  title: { type: 'string' },
                  poster_path: { type: 'string', nullable: true },
                  vote_average: { type: 'number', format: 'float' },
                  release_date: { type: 'string', format: 'date', nullable: true },
                },
                required: ['movie_id', 'title'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Favori créé ou mis à jour',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Favorite' },
              },
            },
          },
          400: {
            description: 'Données invalides',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/favorites/{id}': {
      delete: {
        summary: 'Supprime un favori par identifiant de film',
        tags: ['Favorites'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: {
            description: 'Favori supprimé',
          },
          404: {
            description: 'Favori introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
}

module.exports = swaggerSpec
