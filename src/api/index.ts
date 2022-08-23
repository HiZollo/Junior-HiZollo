import config from "../../config";
import {  GatewayIntentBits } from "./types/types";
import { Client, Message, Permissions } from "./structures";
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
  if (!message.inGuild()) return;
  const channel = await message.fetchChannel();
  if ('permissionsFor' in channel) {
    console.log(channel.permissionsFor(message.member)?.toArray());
  }
});

client.on(ClientEvents.GuildCreate, rawGuild => {
  console.log(rawGuild.name);
});

client.on(ClientEvents.InteractionCreate, async rawInteraction => {
  const interaction = InteractionUtil.createInteraction(client, rawInteraction);

  if (interaction.isCommand() && interaction.inGuild()) {
    console.log(new Permissions(interaction.member.permissions).toArray());
  }
});

client.login();