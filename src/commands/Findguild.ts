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

import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { Translator } from "../classes/Translator";
import { CommandType } from "../typings/enums";

export default class Findguild extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'findguild', 
      description: '獲得指定伺服器的資訊', 
      aliases: ['fg'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '伺服器',
        description: '伺服器的 ID',
        required: true
      }]
    });
  }

  public async execute(source: Source, [guildId]: [string]): Promise<void> {
    const results = await source.client.shard?.broadcastEval(async (client, { guildId }) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return;

      const { name, id, memberCount, joinedTimestamp } = guild;
      const shardId = client.shard?.ids[0];
      const owner = await guild.fetchOwner();
      const icon = guild.iconURL({ extension: 'png', size: 4096, forceStatic: false });
      const permissions = guild.members.me?.permissions.toArray();

      return {
        id: id,
        name: name,
        icon: icon,
        shardId: shardId,
        memberCount: memberCount,
        joinedAt: joinedTimestamp,
        permissions: permissions,
        ownerId: owner.user.id
      }
    }, { context: { guildId } });

    const guild = results?.find(e => e);

    if (!guild) {
      await source.defer({ ephemeral: true });
      await source.update('我找不到這個伺服器');
      return;
    }

    await source.defer();
    const info = new EmbedBuilder()
      .applyHiZolloSettings(source.member, `伺服器 ${guild.name} 的資訊`)
      .setThumbnail(guild.icon)
      .addFields(
        { name: '伺服器 ID', value: guild.id },
        { name: '分支編號', value: guild.shardId ?`${guild.shardId}` : '查無資訊' },
        { name: '成員數量', value: `${guild.memberCount}` },
        { name: 'HiZollo 加入時間', value: `<t:${~~(guild.joinedAt/1000)}>` },
        { name: 'HiZollo 擁有權限', value: guild?.permissions ? guild?.permissions.map(p => Translator.getPermissionChinese(p)).join('．') : '查無資訊' },
        { name: '擁有者', value: `<@${guild.ownerId}>` }
      );
    await source.update({ embeds: [info] });
  }
}
