# Backend

## Prérequis

- Node.js
- MySQL (Laragon)

## Installation

```bash
cd backend
npm install
```

## Variables d’environnement

Copie `./.env-sample` vers `./.env` et adapte si besoin.

## Initialiser la base

```bash
cd backend
npm run db:init
```

Si tu veux créer un utilisateur MySQL dédié (ex: `todo-admin` / `todo-password`) lors du init:

- Mets `DB_CREATE_USER=true` dans `./.env`
- Ajuste `DB_APP_USER`, `DB_APP_PASSWORD`, `DB_APP_HOST`

## Lancer le serveur

```bash
cd backend
npm run start
```

Endpoints:

- `GET /api/health`
- `GET /api/todos`
- `POST /api/todos`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`
