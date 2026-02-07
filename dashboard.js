import express from "express";
import db from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT userId, streak
    FROM streaks
    ORDER BY streak DESC
    LIMIT 20
  `).all();

  res.render("leaderboard", { rows });
});

app.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const sessions = db.prepare(`
    SELECT * FROM sessions WHERE userId = ? ORDER BY sessionNumber ASC
  `).all(userId);

  const streakRow = db.prepare(`
    SELECT streak FROM streaks WHERE userId = ?
  `).get(userId);

  res.render("dashboard", {
    userId,
    streak: streakRow ? streakRow.streak : 0,
    sessions
  });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Dashboard running")
);
