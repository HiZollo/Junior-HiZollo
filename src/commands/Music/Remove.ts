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

import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../typings/enums";
import { ApplicationCommandOptionType } from "discord.js";

export default class MusicRemove extends Command<[number, number]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'remove', 
      description: '將待播清單中的指定歌曲移除', 
      extraDescription: '起始歌曲編號的預設值為 1，終止歌曲編號的預設值為起始歌曲編號', 
      aliases: ['rm'], 
      options: [{
        type: ApplicationCommandOptionType.Integer, 
        name: '起始歌曲編號', 
        description: '要從哪一首歌開始移除', 
        required: false, 
        minValue: 1
      }, {
        type: ApplicationCommandOptionType.Integer, 
        name: '終止歌曲編號', 
        description: '要移除到哪一首歌', 
        required: false, 
        minValue: 1
      }]
    });
  }

  public async execute(source: Source, [start, end]: [number, number]): Promise<void> {
    if (!source.guild.members.me?.voice.channel) {
      await source.defer({ ephemeral: true });
      await source.update('我並沒有在任何語音頻道內，你是不是搞錯了什麼');
      return;
    }
    if (!source.member.voice.channel) {
      await source.defer({ ephemeral: true });
      await source.update('你必須加入我的語音頻道才可以使用這個指令');
      return;
    }
    if (source.member.voice.channelId !== source.guild.members.me.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('我跟你並不在同一個語音頻道，因此你無法使用此指令');
      return;
    }
    const queue = source.client.music.getQueue(source.guild.id);
    if (!queue?.length) {
      await source.defer({ ephemeral: true });
      await source.update('我想待播清單應該已經沒有東西可以被移除了，你要不要檢查看看');
      return;
    }

    start = start ?? 1;
    end = end ?? start;

    if (start > end) {
      await source.defer({ ephemeral: true });
      await source.update('結尾怎麼會小於開頭呢？這樣怎麼對？');
      return;
    }

    if (queue.length < start) {
      await source.defer({ ephemeral: true });
      await source.update('我不覺得有這個編號的歌的存在，請檢查一下播放清單或是你的眼睛');
      return;
    }

    await source.defer();
    end = Math.min(end, queue.length);
    source.client.music.spliceQueue(source.guild.id, start - 1, end - start + 1);

    const content = start === end ? `已移除編號為 ${start} 的歌曲` : `已移除編號在 ${start} 到 ${end} 之間的所有歌曲`;
    await source.update(content);
  }
}
