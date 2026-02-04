import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { authRouter } from './auth/router.js';
import { todosRouter } from './todos/router.js';

// Création de l'application Express
const app = express();

// Configuration de CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3100';

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

// Configuration de l'analyseur de corps de requête JSON
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false }));

// Route de santé pour vérifier si le serveur est en cours d'exécution
app.get('/api/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Utilisation du routeur pour les todos
app.use('/api/auth', authRouter);
app.use('/api/todos', todosRouter);

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trouvé' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  res.status(status).json({
    error: err?.message || 'Erreur interne du serveur',
  });
});

// Démarrage du serveur sur le port spécifié
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`[backend] écoute sur http://localhost:${port}`);
});