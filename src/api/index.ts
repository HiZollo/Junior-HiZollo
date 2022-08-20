import "dotenv/config";
import { GatewayIntentBits } from "./types/types";
import { Client } from "./structures";
import { ClientEvents } from "./types/enum";
import { InteractionUtil } from "./utils";

if (!process.env.TOKEN) throw new Error("Token not set.");
const client = new Client({
  token: process.env.TOKEN, 
  intents: 
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildMessageReactions |
    GatewayIntentBits.GuildVoiceStates |
    GatewayIntentBits.MessageContent
});

client.on(ClientEvents.Ready, shardId => {
  console.log(shardId);
});

client.on(ClientEvents.MessageCreate, async () => {
});

client.on(ClientEvents.InteractionCreate, async rawInteraction => {
  const interaction = InteractionUtil.createInteraction(client, rawInteraction);

  if (interaction.isCommand()) {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('Pong!');
    const m = await interaction.followUp({ content: 'P:thinking:ng!', ephemeral: true });
    console.log(m);
  }
});

client.login();