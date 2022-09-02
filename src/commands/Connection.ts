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
import { CommandType, PageSystemMode } from "../utils/enums";
import { PageSystemPagesOptions } from "../utils/interfaces";
import pageSystem from "../features/utils/pageSystem";

export default class Connection extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Developer, 
      name: 'connection', 
      description: '查看我的語音連線情形', 
      extraDescription: '也可以把指定的語音連線截斷', 
      aliases: ['con']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();

    const connections = await source.client.shard?.broadcastEval(client => {
      return client.music.map(manager => ({
        name: manager.guild.name, 
        id: manager.guild.id, 
        memberCount: manager.voiceChannel.members.size, 
        working: manager.working
      }));
    }).then(r => r.reduce((acc, now) => acc.concat(now), []));

    if (!connections?.length) {
      await source.update('沒有人在聽音樂');
      return;
    }

    const pages: PageSystemPagesOptions[][] = [];
    connections?.forEach((con, i) => {
      if (i % 5 === 0) pages.push([]);
      pages[Math.trunc(i / 5)].push({
        name: `${con.name}\n\`GID\` ${con.id}\n\`STS\` ${con.working ? '播放中' : '閒置'}\n\`CNT\` ${con.memberCount}`,
        guildName: con.name, 
        id: con.id
      });
      i++;
    });

    const embed = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 的音樂中心');

    const selected = await pageSystem({
      mode: PageSystemMode.Description, 
      source: source, 
      embed: embed, 
      description: '請選擇一個連線以將其從記錄中刪除', 
      pages: pages, 
      contents: {
        exit: '清單已關閉', 
        idle: '清單已因閒置過久而關閉'
      }, 
      allowSelect: true
    });

    if (selected) {
      source.client.music.leave(selected.id);
      await source.update(`已退出 ${selected.guildName}`);
    }
  }
}