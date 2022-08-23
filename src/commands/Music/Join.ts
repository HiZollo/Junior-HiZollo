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
import { CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

export default class MusicJoin extends Command<[boolean]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'join', 
      description: '讓我加入你所在的語音頻道', 
      aliases: ['j'], 
      options: [{
        type: ApplicationCommandOptionType.Boolean, 
        name: '自動下台', 
        description: '在舞台頻道中播完音樂後是否自動退下舞台', 
        required: false
      }], 
      permissions: {
        bot: [PermissionFlagsBits.Connect]
      }
    });
  }

  public async execute(source: Source, [autoSuppress]: [boolean]): Promise<void> {
    if (!source.member.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('請先加入一個語音頻道');
      return;
    }
    if (source.client.music.has(source.guild.id)) {
      await source.defer({ ephemeral: true });
      await source.update(
        source.member.voice.channelId !== source.guild.members.me?.voice.channelId ?
          '我已經在這個伺服器的其他語音頻道了，請先將我退出再行加入' :
          '我已經在你所在的語音頻道裡了，你沒看見嗎？'
      );
      return;
    }
    if (!source.member.voice.channel?.joinable) {
      await source.defer({ ephemeral: true });
      await source.update('我無法加入此頻道');
      return;
    }

    await source.defer();
    source.client.music.join(source.member.voice.channel, source.channel, autoSuppress ?? false);
    await source.update(`已加入 \`${source.member.voice.channel.name}\``);
  }
}