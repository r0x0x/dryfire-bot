
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import db from "./db.js";
import { updateStreak, getStreak } from "./streaks.js";
import "./dashboard.js";
	function formatPST(timestamp) {
		return new Date(timestamp).toLocaleString("en-US", {
		timeZone: "America/Los_Angeles",
		});
	}

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages]
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;

  // /dryfired
  if (interaction.commandName === "dryfired") {
  const title = interaction.options.getString("title");
  const description = interaction.options.getString("description");
  const duration = interaction.options.getString("duration") || "Not specified";

  const count = db.prepare("SELECT COUNT(*) AS c FROM sessions WHERE userId = ?").get(userId).c;
  const sessionNumber = count + 1;
  const timestamp = Date.now();

  db.prepare(`
    INSERT INTO sessions (userId, sessionNumber, title, description, duration, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, sessionNumber, title, description, duration, timestamp);

  const streak = updateStreak(userId);

  return interaction.reply({
    content:
      `**Dry Fire Session Logged**\n` +
      `**Session:** ${sessionNumber}\n` +
      `**Date:** ${formatPST(timestamp)}\n` +
      `**Title:** ${title}\n` +
      `**Description:** ${description}\n` +
      `**Duration:** ${duration}\n\n` +
      `🔥 **Current Streak:** ${streak} days`,
  });
}



  // /editdf
  if (interaction.commandName === "editdf") {
  const sessionNumber = interaction.options.getInteger("sessionnumber");
  const newTitle = interaction.options.getString("title");
  const newDescription = interaction.options.getString("description");
  const newDuration = interaction.options.getString("duration");

  const row = db.prepare(`
    SELECT * FROM sessions WHERE userId = ? AND sessionNumber = ?
  `).get(userId, sessionNumber);

  if (!row) {
    return interaction.reply({ content: "Session not found.", ephemeral: true });
  }

  db.prepare(`
    UPDATE sessions
    SET title = COALESCE(?, title),
        description = COALESCE(?, description),
        duration = COALESCE(?, duration)
    WHERE userId = ? AND sessionNumber = ?
  `).run(newTitle, newDescription, newDuration, userId, sessionNumber);

  const updated = db.prepare(`
    SELECT * FROM sessions WHERE userId = ? AND sessionNumber = ?
  `).get(userId, sessionNumber);

  return interaction.reply({
    content:
      `**Dry Fire Session Updated**\n` +
      `**Session:** ${updated.sessionNumber}\n` +
      `**Date:** ${formatPST(updated.timestamp)}\n` +
      `**Title:** ${updated.title}\n` +
      `**Description:** ${updated.description}\n` +
      `**Duration:** ${updated.duration}`,
  });
}



  // /listdryfiresessions
  if (interaction.commandName === "listdryfiresessions") {
    const sessions = db.prepare(`
      SELECT * FROM sessions WHERE userId = ? ORDER BY sessionNumber ASC
    `).all(userId);

    if (sessions.length === 0) {
      return interaction.reply({ content: "No sessions logged.", ephemeral: true });
    }

    const streak = getStreak(userId);

    const lines = sessions.map(s => {
      const date = new Date(s.timestamp);
      return `**DF Session ${s.sessionNumber}:** ${formatPST(s.timestamp)}\n` +
       `• ${s.title}\n` +
       `• ${s.description}\n` +
       `• Duration: ${s.duration}\n`;

    });

    try {
      await interaction.user.send(
        `Your current streak: **${streak} days**\n\n` + lines.join("\n")
      );
      return interaction.reply({ content: "Sent to your DMs.", ephemeral: true });
    } catch {
      return interaction.reply({ content: "Enable DMs to receive your list.", ephemeral: true });
    }
  }

  // /leaderboard
  if (interaction.commandName === "leaderboard") {
    const rows = db.prepare(`
      SELECT userId, streak
      FROM streaks
      ORDER BY streak DESC
      LIMIT 10
    `).all();

    if (rows.length === 0) {
      return interaction.reply("No streak data yet.");
    }

    const lines = rows.map((r, i) =>
      `**${i + 1}.** <@${r.userId}> — **${r.streak} days**`
    );

    return interaction.reply(lines.join("\n"));
  }
});

client.login(process.env.DISCORD_TOKEN);
