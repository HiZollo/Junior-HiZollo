import config from "../../config";
import { GatewayIntentBits } from "./types/types";
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
  if (rawMessage.author.bot) return;
  const message = new Message(client, rawMessage);
  if (!message.inGuild()) return;
  
  await message.send({
    files: [{
      attachment: './src/pictures/badbot.jpg', 
      name: 'badbot.jpg'
    }, {
      attachment: './src/pictures/badbot.jpg', 
      name: 'badbot.jpg'
    }]
  });
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