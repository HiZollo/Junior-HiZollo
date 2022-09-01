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
import { ArgumentParseType, CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

export default class MusicPlay extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'play', 
      description: '讓我在語音頻道中播一首歌', 
      aliases: ['p'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '影片', 
        description: '可以是關鍵字、Youtube 影片連結或 Youtube 播放清單連結', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }, 
      permissions: {
        bot: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.Speak]
      }
    });
  }

  public async execute(source: Source, [keywordOrUrl]: [string]): Promise<void> {
    if (!source.client.music.has(source.guild.id)) {
      const command = source.client.commands.search(['music', 'join']) as Command;
      await command.execute(source, [true]);
      if (!source.guild.members.me?.voice.channel) return;
    }

    if (!source.member.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('請先加入一個語音頻道');
      return;
    }
    if (source.member.voice.channelId !== source.guild.members.me?.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('你必須跟我在同一個語音頻道裡面才可以點歌');
      return;
    }

    if (!source.deferred) await source.defer();
    await source.client.music.play(source, keywordOrUrl);
  }
}