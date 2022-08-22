import config from "../../config";
import { GatewayIntentBits } from "./types/types";
import { Client, Message } from "./structures";
import { ClientEvents } from "./types/enum";
import { InteractionUtil } from "./utils";

const client = new Client({
  id: config.bot.id, 
  token: config.bot.token, 
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
  const message = new Message(client, rawMessage);
  console.log(message.memberPermissions?.toArray());
});

client.on(ClientEvents.GuildCreate, rawGuild => {
  console.log(true || rawGuild.roles);
});

client.on(ClientEvents.InteractionCreate, async rawInteraction => {
  const interaction = InteractionUtil.createInteraction(client, rawInteraction);

  if (interaction.isCommand()) {
  }
});

client.login();