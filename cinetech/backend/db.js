/**
 * Initialisation de la base SQLite pour la Cinéthèque.
 * - Fichier de base: backend/cinetech.db
 * - Table: favorites (stocke les films/séries favoris)
 */
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Chemin vers le fichier de base de données
const dbPath = path.join(__dirname, 'cinetech.db')

// Ouverture/Création de la base de données
const db = new sqlite3.Database(dbPath)

// Création de la table 'favorites' si inexistante
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER UNIQUE,
      title TEXT,
      poster_path TEXT,
      vote_average REAL,
      release_date TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  )
})

module.exports = db
