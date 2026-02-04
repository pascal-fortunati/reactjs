import 'dotenv/config';
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
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

  // Vérification si la colonne user_id existe déjà
  const [[hasUserIdColumnRow]] = await connection.query(
    "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'todos' AND COLUMN_NAME = 'user_id'",
    [dbName]
  );

  // Ajout de la colonne user_id si elle n'existe pas
  const hasUserIdColumn = Number(hasUserIdColumnRow?.count) > 0;
  if (!hasUserIdColumn) {
    await connection.query("ALTER TABLE todos ADD COLUMN user_id CHAR(36) NULL AFTER id");
  }

  // Vérification si l'index existe déjà
  const [[hasIndexRow]] = await connection.query(
    "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'todos' AND INDEX_NAME = 'idx_todos_user_created'",
    [dbName]
  );
  const hasIndex = Number(hasIndexRow?.count) > 0;
  if (!hasIndex) {
    await connection.query('ALTER TABLE todos ADD INDEX idx_todos_user_created (user_id, created_at)');
  }

  // Création d'un utilisateur de démonstration si nécessaire
  const demoEmail = process.env.DEMO_USER_EMAIL || 'user@localhost';
  const demoPassword = process.env.DEMO_USER_PASSWORD || 'user123';

  // Vérification si l'utilisateur de démonstration existe déjà
  const [[existingDemoUser]] = await connection.query('SELECT id FROM users WHERE email = ? LIMIT 1', [demoEmail]);
  let demoUserId = existingDemoUser?.id;

  // Ajout de l'utilisateur de démonstration si nécessaire
  if (!demoUserId) {
    demoUserId = crypto.randomUUID();
    const rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(demoPassword, rounds);
    await connection.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [
      demoUserId,
      demoEmail,
      passwordHash,
    ]);
  }

  // Mise à jour des todos sans user_id vers l'utilisateur de démonstration
  await connection.query('UPDATE todos SET user_id = ? WHERE user_id IS NULL', [demoUserId]);

  // Vérification si la colonne user_id est nullable
  const [[isNullableRow]] = await connection.query(
    "SELECT IS_NULLABLE AS isNullable FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'todos' AND COLUMN_NAME = 'user_id' LIMIT 1",
    [dbName]
  );
  const isNullable = String(isNullableRow?.isNullable || '').toUpperCase() === 'YES';
  if (isNullable) {
    await connection.query('ALTER TABLE todos MODIFY user_id CHAR(36) NOT NULL');
  }

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
      'INSERT INTO todos (id, user_id, text, categorie, date_limite, completed) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        demoUserId,
        'Configurer MySQL (Laragon)',
        'Travail',
        toDate(d1),
        0,
        crypto.randomUUID(),
        demoUserId,
        'Tester l’API /api/todos',
        'Urgent',
        toDate(d2),
        0,
        crypto.randomUUID(),
        demoUserId,
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