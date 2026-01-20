/**
 * Routes Favoris (SQLite)
 * - Liste, ajout (upsert) et suppression
 * - Utilise la table 'favorites' dans SQLite
 */
const express = require('express')
const db = require('../db')

const router = express.Router()

// Récupérer tous les favoris
router.get('/', (req, res, next) => {
  db.all('SELECT * FROM favorites ORDER BY added_at DESC', (err, rows) => {
    if (err) {
      return next(err)
    }
    res.json(rows)
  })
})

// Ajouter un favori (INSERT OR REPLACE pour éviter les doublons)
router.post('/', (req, res, next) => {
  const { movie_id, title, poster_path, vote_average, release_date } = req.body
  if (!movie_id || !title) {
    return res.status(400).json({ message: 'movie_id et title requis' })
  }

  const stmt = db.prepare(
    `INSERT OR REPLACE INTO favorites (movie_id, title, poster_path, vote_average, release_date)
     VALUES (?, ?, ?, ?, ?)`,
  )

  stmt.run(movie_id, title, poster_path, vote_average, release_date, function callback(err) {
    if (err) {
      return next(err)
    }
    db.get('SELECT * FROM favorites WHERE movie_id = ?', [movie_id], (selectErr, row) => {
      if (selectErr) {
        return next(selectErr)
      }
      res.status(201).json(row)
    })
  })
})

// Supprimer un favori par movie_id
router.delete('/:id', (req, res, next) => {
  const { id } = req.params
  db.run('DELETE FROM favorites WHERE movie_id = ?', [id], function callback(err) {
    if (err) {
      return next(err)
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Favori introuvable' })
    }
    res.status(204).send()
  })
})

module.exports = router
