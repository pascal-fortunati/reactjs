import 'dotenv/config';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

// Configuration de la connexion à la base de données
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'todolist';

// Vérification si l'utilisateur doit être créé
const shouldCreateUser = ['1', 'true', 'yes', 'on'].includes(
  String(process.env.DB_CREATE_USER || '').trim().toLowerCase()
);
// Configuration des informations de l'utilisateur de l'application
const appDbUser = process.env.DB_APP_USER || 'todo-admin';
const appDbPassword = process.env.DB_APP_PASSWORD || 'todo-password';
const appDbHost = process.env.DB_APP_HOST || 'localhost';

// Chemin vers le fichier de schéma SQL
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../../sql/schema.sql');
const schemaSql = await readFile(schemaPath, 'utf8');

// Création d'une connexion à la base de données
const connection = await mysql.createConnection({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  multipleStatements: true,
});

// Création de la base de données si elle n'existe pas
try {
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);
  await connection.query(schemaSql);

  // Création de l'utilisateur de l'application si nécessaire
  if (shouldCreateUser) {
    const userAtHost = `${connection.escape(appDbUser)}@${connection.escape(appDbHost)}`;
    const databaseId = typeof connection.escapeId === 'function' ? connection.escapeId(dbName) : `\`${String(dbName).replaceAll('`', '``')}\``;

    await connection.query(
      `CREATE USER IF NOT EXISTS ${userAtHost} IDENTIFIED BY ${connection.escape(appDbPassword)}`
    );
    await connection.query(`GRANT ALL PRIVILEGES ON ${databaseId}.* TO ${userAtHost}`);
    await connection.query('FLUSH PRIVILEGES');
  }
  
  // Vérification si la table todos est vide
  const [[countRow]] = await connection.query('SELECT COUNT(*) AS count FROM todos');
  const count = Number(countRow?.count) || 0;

  if (count === 0) {
    const today = new Date();
    const toDate = (d) => d.toISOString().slice(0, 10);

    const d1 = new Date(today);
    d1.setDate(d1.getDate() + 2);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() + 5);

    await connection.query(
      'INSERT INTO todos (id, text, categorie, date_limite, completed) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        'Configurer MySQL (Laragon)',
        'Travail',
        toDate(d1),
        0,
        crypto.randomUUID(),
        'Tester l’API /api/todos',
        'Urgent',
        toDate(d2),
        0,
        crypto.randomUUID(),
        'Faire une pause',
        'Personnel',
        null,
        1,
      ]
    );
  }

  console.log(`Base de données ${dbName} créer avec succès`);
} finally {
  await connection.end();
}