import crypto from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { requireAuth } from './requireAuth.js';

export const authRouter = Router();

// Fonction de normalisation d'email
function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

// Fonction de validation d'email
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  if (email.length < 5 || email.length > 254) return false;
  if (/^[^\s@]+@localhost$/.test(email)) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Fonction de génération de token JWT
function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT_SECRET manquant');
    err.status = 500;
    throw err;
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn });
}

// Fonction de normalisation de nom
function parseName(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 80) return null;
  return trimmed;
}

// Route d'inscription d'un utilisateur
authRouter.post('/register', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const firstName = parseName(req.body?.firstName);
    const lastName = parseName(req.body?.lastName);

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (min 8)' });

    const [[existing]] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing?.id) return res.status(409).json({ error: 'Email déjà utilisé' });

    const id = crypto.randomUUID();
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    await pool.query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [id, email, passwordHash, firstName, lastName]
    );

    const user = { id, email, firstName, lastName };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Route de connexion d'un utilisateur
authRouter.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!password) return res.status(400).json({ error: 'Mot de passe requis' });

    const [[row]] = await pool.query(
      'SELECT id, email, password_hash AS passwordHash, first_name AS firstName, last_name AS lastName FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!row) return res.status(401).json({ error: 'Identifiants invalides' });
    const ok = await bcrypt.compare(password, row.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

    const user = {
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? null,
      lastName: row.lastName ?? null,
    };

    const token = signToken(user);
    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Route de récupération des informations de l'utilisateur connecté
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const [[row]] = await pool.query(
      'SELECT id, email, first_name AS firstName, last_name AS lastName, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!row) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.status(200).json(row);
  } catch (err) {
    next(err);
  }
});