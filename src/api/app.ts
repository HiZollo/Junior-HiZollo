import config from "../../config";
import { GatewayIntentBits } from "./types/types";
import { Client, Permissions } from "./structures";
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
  if (rawMessage.author.bot) return;
  if (!rawMessage.guild_id) return;
  console.log(client.guilds);
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