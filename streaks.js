import db from "./db.js";
import dayjs from "dayjs";

export function updateStreak(userId) {
  const today = dayjs().format("YYYY-MM-DD");

  const row = db.prepare("SELECT * FROM streaks WHERE userId = ?").get(userId);

  if (!row) {
    db.prepare("INSERT INTO streaks (userId, streak, lastSessionDate) VALUES (?, ?, ?)")
      .run(userId, 1, today);
    return 1;
  }

  const last = dayjs(row.lastSessionDate);

  if (last.isSame(today, "day")) {
    return row.streak;
  }

  if (last.add(1, "day").isSame(today, "day")) {
    const newStreak = row.streak + 1;
    db.prepare("UPDATE streaks SET streak = ?, lastSessionDate = ? WHERE userId = ?")
      .run(newStreak, today, userId);
    return newStreak;
  }

  db.prepare("UPDATE streaks SET streak = ?, lastSessionDate = ? WHERE userId = ?")
    .run(1, today, userId);
  return 1;
}

export function getStreak(userId) {
  const row = db.prepare("SELECT streak FROM streaks WHERE userId = ?").get(userId);
  return row ? row.streak : 0;
}
