/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { ApplicationCommandOptionType, EmbedBuilder, Webhook } from "discord.js";
import config from "@root/config";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";
import { Translator } from "../classes/Translator";

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

    let description = this.networkDescription;
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

  private networkDescription = 
`**HiZollo Network** 是一個大型聊天室，你可以與伺服器以外的成員聊天互動
使用前，請確保伺服器沒有開啟 2FA，且 HiZollo 有__${Translator.getPermissionChinese('ManageWebhooks')}__的權限
你只要建立一個名為 \`#hz-network-[埠號]\` 的頻道，就能加入 HiZollo Network 了
目前可用的埠號有 \`1\`、\`8\`、\`9\`、\`27\`，注意埠號不含方括號 \`[]\`

在 HiZollo Network 中，每一條訊息都會被發送到所有相同埠號的頻道
也因為訊息會被發送到整個聯絡網中，請勿發送任何惡意攻擊、釣魚連結等不當的訊息內容

以下是當前 HiZollo Network 的狀態：
`
}
