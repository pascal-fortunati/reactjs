const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const DATA_PATH = path.join(__dirname, "..", "data", "users.json");

function readUsers() {
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2), "utf8");
}

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    avatarUrl: u.avatarUrl || "",
    completedRecipes: Array.isArray(u.completedRecipes)
      ? u.completedRecipes
      : [],
    favoriteRecipes: Array.isArray(u.favoriteRecipes)
      ? u.favoriteRecipes
      : [],
  };
}

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  const users = readUsers();
  const lower = String(username).toLowerCase();
  const exists = users.some((u) => String(u.username).toLowerCase() === lower);
  if (exists) {
    return res.status(400).json({ error: "username already exists" });
  }
  const id =
    Math.random().toString(36).slice(2) + Date.now().toString(36);
  const passwordHash = await bcrypt.hash(String(password), 10);
  const newUser = {
    id,
    username: String(username),
    passwordHash,
    avatarUrl: "",
    completedRecipes: [],
    favoriteRecipes: [],
  };
  users.push(newUser);
  writeUsers(users);
  return res.json(publicUser(newUser));
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  const users = readUsers();
  const lower = String(username).toLowerCase();
  const user = users.find(
    (u) => String(u.username).toLowerCase() === lower,
  );
  if (!user) {
    return res.status(400).json({ error: "user not found" });
  }
  const ok = await bcrypt.compare(String(password), String(user.passwordHash));
  if (!ok) {
    return res.status(400).json({ error: "invalid password" });
  }
  return res.json(publicUser(user));
});

app.patch("/api/profile/avatar", (req, res) => {
  const { userId, avatarUrl } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: "userId required" });
  }
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return res.status(400).json({ error: "user not found" });
  }
  users[idx].avatarUrl = String(avatarUrl || "");
  writeUsers(users);
  return res.json(publicUser(users[idx]));
});

app.patch("/api/profile/completed", (req, res) => {
  const { userId, recipeId } = req.body || {};
  if (!userId || !recipeId) {
    return res
      .status(400)
      .json({ error: "userId and recipeId required" });
  }
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return res.status(400).json({ error: "user not found" });
  }
  const list = Array.isArray(users[idx].completedRecipes)
    ? users[idx].completedRecipes
    : [];
  if (!list.includes(recipeId)) {
    list.push(String(recipeId));
    users[idx].completedRecipes = list;
    writeUsers(users);
  }
  return res.json(publicUser(users[idx]));
});

app.patch("/api/profile/favorites", (req, res) => {
  const { userId, recipeId } = req.body || {};
  if (!userId || !recipeId) {
    return res
      .status(400)
      .json({ error: "userId and recipeId required" });
  }
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) {
    return res.status(400).json({ error: "user not found" });
  }
  const list = Array.isArray(users[idx].favoriteRecipes)
    ? users[idx].favoriteRecipes
    : [];
  const strId = String(recipeId);
  const exists = list.includes(strId);
  users[idx].favoriteRecipes = exists
    ? list.filter((id) => id !== strId)
    : [...list, strId];
  writeUsers(users);
  return res.json(publicUser(users[idx]));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});