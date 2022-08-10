import { ApplicationCommandOptionType, EmbedBuilder, Webhook } from "discord.js";
import config from "../config";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Hznetwork extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Network, 
      name: 'hznetwork', 
      description: '查看 HiZolllo Network 的即時資訊', 
      aliases: ['hzn'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '埠號',
        description: '已開放的埠號',
        required: false,
        choices: [
          { name: '1', value: '1' },
          { name: '8', value: '8' },
          { name: '9', value: '9' },
          { name: '27', value: '27' }
        ]
      }]
    });
  }

  public async execute(source: Source, [portNo]: [string]): Promise<void> {
    await source.defer();

    if (!portNo) {
      const embed = await this.getEmbedForAllPorts(source);
      await source.update({ embeds: [embed] });
    }
    else {
      const embed = await this.getEmbedForPort(source, portNo);
      await source.update({ embeds: [embed] });
    }
  }

  private async getEmbedForAllPorts(source: Source): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo Network 中心');

    let description = '';
    for (const portNo of source.client.network.publicPortNo) {
      const channelCounts = await source.client.shard?.broadcastEval((client, {portNo}) => {
        return client.network.ports.get(portNo)?.size ?? 0;
      }, { context: { portNo } }) ?? [];
      const channelCount = channelCounts.reduce((acc, count) => acc + count, 0);
      description += `${portNo} 號埠 - ${channelCount} 個頻道在線\n`;
    }

    return embed.setTitle('在線網絡清單')
      .setDescription(description)
      .setFooter({ text: `${source.user.tag}．新增名稱格式為 #${config.bot.network.portPrefix}[埠號] 的頻道以加入網絡！`, iconURL: source.user.displayAvatarURL() });
  }

  private async getEmbedForPort(source: Source, portNo: string): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo Network 中心');
    
    const counts = await source.client.shard?.broadcastEval((client, {portNo}) => {
      const port = client.network.ports.get(portNo) as Map<string, Webhook>;
      const channelCount = port.size ?? 0;
      const userCount = [...port.values()]
        .map(webhook => client.guilds.resolve(webhook.guildId)?.memberCount ?? 0)
        .reduce((acc, cur) => acc + cur, 0);
      return { channelCount, userCount }
    }, { context: { portNo } });

    const channelCount = counts?.reduce((acc, count) => acc + count.channelCount, 0) ?? 0;
    const userCount = counts?.reduce((acc, count) => acc + count.userCount, 0) ?? 0;

    return embed.setTitle(`${portNo} 號埠詳細資訊`)
      .addFields(
        { name: '頻道約束名稱', value: `${config.bot.network.portPrefix}${portNo}` },
        { name: '總頻道數量', value: `${channelCount}` },
        { name: '使用者數量', value: `${userCount}` }
      )
      .setFooter({ text: `${source.user.tag}．新增名稱格式為 #${config.bot.network.portPrefix}${portNo} 的頻道以加入此網絡！`, iconURL: source.user.displayAvatarURL() });
  }
}