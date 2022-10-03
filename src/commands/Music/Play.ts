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
import { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import Constant from '../../constant.json';

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
    //// <Lock>
    if (process.env.ENABLE_YT === '1') {
      const embed = new EmbedBuilder()
        .applyHiZolloSettings(source.member, 'HiZollo 的幫助中心')
        .setDescription(
`
由於 Google 和 Discord 的規範越來越嚴格，為了保證能繼續為各位提供服務，我們將暫時關閉音樂功能。

我們會在設計好一個能夠運作的新的音樂功能後重新對外開放，請各位多注意我們的公告（</annoucement:894066153654198372>）。

在這之前，你可以考慮使用 </youtube:894066844405739520> 指令來在語音頻道中播放來自 Youtube 的音樂。

如果有任何問題或意見，你可以查看我們的[最近公告](${Constant.websiteLinks.annoucement})或加入 [HiZollo 官方伺服器](${Constant.mainGuild.inviteLink})。
`);
      await source.defer();
      await source.update({ embeds: [embed] });
      return;
    }
    //// </Lock>

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