import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder()
  .setName("dryfired")
  .setDescription("Log a new dry fire session")
  .addStringOption(opt =>
    opt.setName("title").setDescription("Title").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("description").setDescription("Description").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("duration").setDescription("How long you trained (e.g., 15 min)")
  ),

new SlashCommandBuilder()
  .setName("editdf")
  .setDescription("Edit a dry fire session")
  .addIntegerOption(opt =>
    opt.setName("sessionnumber").setDescription("Session number").setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName("title").setDescription("New title")
  )
  .addStringOption(opt =>
    opt.setName("description").setDescription("New description")
  )
  .addStringOption(opt =>
    opt.setName("duration").setDescription("New duration")
  ),


  new SlashCommandBuilder()
    .setName("listdryfiresessions")
    .setDescription("DMs you your dry fire sessions"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Show the top dry fire streaks")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deploy() {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Commands registered");
}

deploy();
