import "dotenv/config";
import { GatewayIntentBits } from "./types/types";
import { Client } from "./structures";
import { ClientEvents } from "./types/enum";

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

client.on(ClientEvents.MessageCreate, async rawMessage => {
  console.log(rawMessage);
});

client.on(ClientEvents.InteractionCreate, async rawInteraction => {
  console.log(rawInteraction);
});

client.login();