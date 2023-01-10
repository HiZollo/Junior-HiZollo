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

import { EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import pageSystem from "../features/utils/pageSystem";
import { CommandType, PageSystemMode } from "../typings/enums";

type GuildInfo = {
  id: string, 
  memberCount: number, 
  name: string, 
  shardId?: number
};

export default class Getguildlist extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'getguildlist', 
      description: '獲取我所在的伺服器列表', 
      aliases: ['ggl'],
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const guildLists: GuildInfo[][] | undefined = await source.client.shard?.broadcastEval(client => {
      return client.guilds.cache.map(guild => ({
        id: guild.id,
        memberCount: guild.memberCount,
        name: guild.name,
        shardId: client.shard?.ids[0]
      }));
    });

    if (!guildLists) {
      await source.update('找不到分支資訊');
      return;
    }

    const pages: ({ name: string, id: string })[][] = [];
    guildLists
      .reduce((acc, guild) => acc.concat(guild), [])
      .sort((gA, gB) => gB.memberCount - gA.memberCount)
      .forEach((g, i) => {
        if (i % 10 === 0) pages.push([]);
        pages[~~(i/10)].push({ name: `${g.name}｜分支 ${g.shardId}｜${g.memberCount} 位成員`, id: g.id });
      });
    
    const embed = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 的伺服器中心');
    
    const result = await pageSystem({
      mode: PageSystemMode.Description,
      allowSelect: true,
      description: '請選擇一個伺服器以查看其資訊',
      source: source,
      pages: pages,
      embed: embed, 
      contents: {
        exit: '清單已關閉', 
        idle: '清單因閒置過久而關閉'
      }
    });

    const findguild = source.client.commands.search(['findguild', undefined]);
    if (findguild instanceof Command) {
      await findguild.execute(source, [result?.id]);
    }
  }
}
