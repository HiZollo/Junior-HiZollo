import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import yesNoSystem from "../features/utils/yesNoSystem";
import { CommandType } from "../utils/enums";

export default class Leaveguild extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'leaveguild', 
      description: '退出指定的伺服器', 
      aliases: ['lg'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '伺服器',
        description: '要退出伺服器的 ID',
        required: true
      }]
    });
  }

  public async execute(source: Source, [guildId]: [string]): Promise<void> {
    const results = await source.client.shard?.broadcastEval(async (client, { guildId }) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return;
      return { id: guild.id, name: guild.name, shardId: client.shard?.ids[0] }
    }, { context: { guildId } });

    const guild = results?.find(e => e);

    if (!guild || guild.shardId == null) {
      await source.defer({ ephemeral: true });
      await source.update('我找不到這個伺服器');
      return;
    }

    await source.defer();
    const helper = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的伺服器中心', iconURL: source.client.user?.displayAvatarURL() })
      .setHiZolloColor()
      .setDescription(`你真的確定要退出 ${guild.name} 嗎？`)
      .setFooter({ text: `${source.user.tag}`, iconURL: source.user.displayAvatarURL() });
    
    const answer = await yesNoSystem({
      source: source,
      messageOptions: { embeds: [helper] },
      labels: ['確定', '取消'], 
      contents: {
        idle: '你猶豫太久了！請再試一次'
      }
    });

    if (answer) {
      await source.client.shard?.broadcastEval<void, {guildId: string}>((client, {guildId}) => {
        client.guilds.cache.get(guildId)?.leave();
      }, { context: { guildId }, shard: guild.shardId });
      helper.setDescription(`已退出 ${guild.name}`);
    }
    else {
      helper.setDescription(`好，我會繼續留在 ${guild.name}`);
    }

    await source.channel?.send({ embeds: [helper] });
  }
}