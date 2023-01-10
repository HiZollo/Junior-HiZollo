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
import { PermissionFlagsBits } from "discord.js";

export default class MusicLeave extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'leave', 
      description: '讓我離開語音頻道', 
      extraDescription: '若加入的是舞台頻道，可以額外在後面指定 false，讓機器人只有播歌的時候會成為發言人，其他時候會自動退下', 
      aliases: ['l'], 
      permissions: {
        bot: [PermissionFlagsBits.Connect]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
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

    await source.defer();
    source.client.music.leave(source.member.voice.channel.guild.id);
    await source.update(`已離開 \`${source.member.voice.channel.name}\``);
  }
}
