const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Création de l'application Express
const app = express();
const port = process.env.PORT || 4000;

// Chemin vers le dossier de stockage des scores
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "scores.json");

app.use(cors());
app.use(express.json());

// Chemin vers le dossier de stockage des scores
function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]", "utf8");
  }
}

// Assure que le dossier de stockage et le fichier JSON existent
ensureStorage();

// Lecture des scores depuis le fichier JSON
function readScores() {
  try {
    const content = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

// Écriture des scores dans le fichier JSON
function writeScores(scores) {
  fs.writeFileSync(dataFile, JSON.stringify(scores, null, 2), "utf8");
}

// Route GET pour récupérer les scores triés par moves et time
app.get("/scores", (req, res) => {
  const difficulty = req.query.difficulty;
  let scores = readScores();

  // Filtrer les scores par difficulté si spécifiée
  if (difficulty) {
    scores = scores.filter(score => score.difficulty === difficulty);
  }

  // Trier les scores par moves et time, en priorité sur moves
  scores.sort((a, b) => {
    if (a.moves !== b.moves) {
      return a.moves - b.moves;
    }
    return a.time - b.time;
  });

  // Retourner les 10 meilleurs scores
  res.json({ scores: scores.slice(0, 10) });
});

// Route POST pour ajouter un nouveau score
app.post("/scores", (req, res) => {
  const { playerName, moves, time, difficulty } = req.body;

  // Validation des données reçues
  if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
    return res.status(400).json({ error: "Nom du joueur requis" });
  }

  // Validation des données de score
  if (typeof moves !== "number" || typeof time !== "number") {
    return res.status(400).json({ error: "Données de score invalides" });
  }

  // Ajouter le nouveau score au tableau existant
  const scores = readScores();
  const newScore = {
    id: Date.now().toString(),
    playerName: playerName.trim(),
    moves,
    time,
    difficulty: difficulty || "normal",
    createdAt: new Date().toISOString()
  };

  // Ajouter le nouveau score au tableau existant
  scores.push(newScore);
  writeScores(scores);

  // Retourner le nouveau score avec le statut 201 Created
  res.status(201).json({ score: newScore });
});

// Démarrage du serveur backend
app.listen(port, () => {
  console.log(`Memory backend listening on http://localhost:${port}`);
});