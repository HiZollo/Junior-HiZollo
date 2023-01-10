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

import { ChannelType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";

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
      .applyHiZolloSettings(source.member, `${guild.name} 的伺服器資訊`)
      .setThumbnail(guild.iconURL({ extension: 'png', size: 4096, forceStatic: false }))
      .addFields(
        { name: '伺服器 ID', value: guild.id },
        { name: 'HiZollo 分支編號', value: client.shard?.ids[0] === undefined ? '查無資訊' : `${client.shard?.ids[0]}`},
        { name: '擁有者', value: `<@${owner.user.id}>` },
        { name: '成員數量', value: `${guild.memberCount}` },
        { name: '頻道數量', value: `文字頻道：${channels.textCount}\n語音頻道：${channels.voiceCount}\n討論串：${channels.threadCount}` },
        { name: '創立時間', value: `<t:${~~(guild.createdTimestamp/1000)}>` }
      );
    await source.update({ embeds: [info] });
  }
}
