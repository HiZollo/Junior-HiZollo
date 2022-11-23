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

import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { bot } from "@root/constant.json";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Botinfo extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'botinfo', 
      description: '取得我的基本資料', 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();

    const { client, guild } = source;
    const totalGuildCount = await client.shard
      ?.fetchClientValues('guilds.cache.size')
      .then(results => results.reduce((acc, gc) => (acc as number) + (gc as number), 0));
    const totalUserCount = await client.shard
      ?.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
      .then(results => results.reduce((acc, mc) => acc + mc, 0));

    const info = new EmbedBuilder().applyHiZolloSettings(source.member, '我的基本資料')
      .setThumbnail(client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null)
      .addFields(
        { name: '版本', value: bot.version },
        { name: 'Discord 使用者名稱', value: client.user?.tag ?? '無法取得' },
        { name: '在此伺服器暱稱', value: guild?.members.me?.nickname ?? '無' },
        { name: '服務伺服器數量', value: `${totalGuildCount ?? '無法取得'}` },
        { name: '服務使用者數量', value: `${totalUserCount ?? '無法取得'}` },
        { name: '上線時間', value: client.readyTimestamp ? `<t:${Math.trunc(new Date(client.readyTimestamp).getTime() / 1000)}:R>` : '無法取得' },
        { name: `加入 ${guild?.name} 日期`, value: guild?.joinedTimestamp ? `<t:${~~(guild?.joinedTimestamp/1000)}:D>` : '無法取得' }
      );
    await source.update({ embeds: [info] });
  }
}