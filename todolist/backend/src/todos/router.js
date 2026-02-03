import crypto from 'node:crypto';
import { Router } from 'express';
import { pool } from '../db/pool.js';

// Routeur pour les todos
export const todosRouter = Router();

// Catégories autorisées
const allowedCategories = new Set(['Personnel', 'Travail', 'Urgent']);

function parseCompleted(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'true' || trimmed === '1') return true;
    if (trimmed === 'false' || trimmed === '0') return false;
    return null;
  }
  return null;
}

// Fonction de validation de catégorie  
// Retourne la catégorie si valide, sinon null
function parseCategory(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!allowedCategories.has(trimmed)) return null;
  return trimmed;
}

// Fonction de validation de dateLimite
// Retourne la dateLimite si valide, sinon null
function parseDateLimite(value) {
  if (value === null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === 'null') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return trimmed;
}

// Route GET /api/todos
// Retourne la liste de tous les todos triés par date de création décroissante  
todosRouter.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, text, categorie, date_limite AS dateLimite, completed, created_at AS createdAt, updated_at AS updatedAt FROM todos ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// Route GET /api/todos/:id
// Retourne le todo correspondant à l'ID fourni
todosRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, text, categorie, date_limite AS dateLimite, completed, created_at AS createdAt, updated_at AS updatedAt FROM todos WHERE id = ? LIMIT 1',
      [id]
    );

    if (!rows[0]) return res.status(404).json({ error: 'Todo non trouvé' });
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Route POST /api/todos
// Crée un nouveau todo avec les données fournies
todosRouter.post('/', async (req, res, next) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const completedParsed = typeof req.body?.completed === 'undefined' ? false : parseCompleted(req.body?.completed);
    if (completedParsed === null) {
      return res.status(400).json({ error: 'Le champ completed est invalide' });
    }
    const categorie = parseCategory(req.body?.categorie);
    const dateLimite = parseDateLimite(req.body?.dateLimite);

    if (!text) return res.status(400).json({ error: 'Le champ text est nécessaire' });
    if (text.length > 200) return res.status(400).json({ error: 'Le champ text ne peut pas dépasser 200 caractères' });

    const id = crypto.randomUUID();

    await pool.query('INSERT INTO todos (id, text, categorie, date_limite, completed) VALUES (?, ?, ?, ?, ?)', [
      id,
      text,
      categorie,
      dateLimite,
      completedParsed ? 1 : 0,
    ]);

    const [rows] = await pool.query(
      'SELECT id, text, categorie, date_limite AS dateLimite, completed, created_at AS createdAt, updated_at AS updatedAt FROM todos WHERE id = ? LIMIT 1',
      [id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Route PUT /api/todos/:id
// Met à jour le todo correspondant à l'ID fourni avec les données fournies
todosRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const patch = {};

    // Validation et nettoyage du champ text
    if (typeof req.body?.text === 'string') {
      const text = req.body.text.trim();
      if (!text) return res.status(400).json({ error: 'Le champ text ne peut pas être vide' });
      if (text.length > 200) return res.status(400).json({ error: 'Le champ text ne peut pas dépasser 200 caractères' });
      patch.text = text;
    }

    // Validation et nettoyage du champ categorie
    if (typeof req.body?.categorie !== 'undefined') {
      const categorie = parseCategory(req.body?.categorie);
      if (req.body?.categorie !== null && categorie === null) {
        return res.status(400).json({ error: 'La catégorie est invalide' });
      }
      patch.categorie = categorie;
    }

    // Validation et nettoyage du champ dateLimite
    if (typeof req.body?.dateLimite !== 'undefined') {
      const dateLimite = parseDateLimite(req.body?.dateLimite);
      if (req.body?.dateLimite !== null && typeof req.body?.dateLimite !== 'string') {
        return res.status(400).json({ error: 'La date limite est invalide' });
      }
      if (typeof req.body?.dateLimite === 'string' && req.body.dateLimite.trim() !== '' && dateLimite === null) {
        return res.status(400).json({ error: 'La date limite est invalide' });
      }
      patch.date_limite = dateLimite;
    }

    //
    if (typeof req.body?.completed !== 'undefined') {
      const completedParsed = parseCompleted(req.body?.completed);
      if (completedParsed === null) {
        return res.status(400).json({ error: 'Le champ completed est invalide' });
      }
      patch.completed = completedParsed ? 1 : 0;
    }

    // Vérification si au moins un champ a été fourni pour la mise à jour
    const fields = Object.keys(patch);
    if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' });

    const setSql = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => patch[f]);
    const [result] = await pool.query(
      `UPDATE todos SET ${setSql} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo non trouvé' });

    // Récupération du todo mis à jour
    const [rows] = await pool.query(
      'SELECT id, text, categorie, date_limite AS dateLimite, completed, created_at AS createdAt, updated_at AS updatedAt FROM todos WHERE id = ? LIMIT 1',
      [id]
    );
    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Route DELETE /api/todos/:id
// Supprime le todo correspondant à l'ID fourni
todosRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Todo non trouvé' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});