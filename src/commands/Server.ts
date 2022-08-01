import { ChannelType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Server extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Utility, 
      name: 'server', 
      description: '取得這個伺服器的相關資訊', 
      aliases: ['guild'], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    const { client, guild } = source;

    if (!guild) {
      await source.defer({ ephemeral: true });
      await source.update('這個指令只能在伺服器中使用');
      return;
    }
    
    await source.defer();
    const owner = await guild.fetchOwner();
    const channels = {
      textCount: guild.channels.cache.filter(c => c.type === ChannelType.GuildText && !c.isThread()).size,
      voiceCount: guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size,
      threadCount: guild.channels.cache.filter(c => c.isThread()).size,
    };

    const info = new EmbedBuilder()
      .setHiZolloColor()
      .setTitle(`${guild.name} 的伺服器資訊`)
      .setThumbnail(guild.iconURL({ extension: 'png', size: 4096, forceStatic: false }))
      .addFields(
        { name: '伺服器 ID', value: guild.id },
        { name: 'HiZollo 分支編號', value: client.shard?.ids[0] ? `${client.shard?.ids[0]}` : '查無資訊'},
        { name: '擁有者', value: `<@${owner.user.id}>` },
        { name: '成員數量', value: `${guild.memberCount}` },
        { name: '頻道數量', value: `文字頻道：${channels.textCount}\n語音頻道：${channels.voiceCount}\n討論串：${channels.threadCount}` },
        { name: '創立時間', value: `<t:${~~(guild.createdTimestamp/1000)}>` }
      );
    await source.update({ embeds: [info] });
  }
}