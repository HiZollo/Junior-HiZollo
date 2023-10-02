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
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { GameMode } from "@hizollo/osu-api";

export default class OsuUser extends Command<[string, number]> {
  constructor() {
    super({
      type: CommandType.Information,
      parent: 'osu',
      name: 'user',
      description: '取得一名玩家的 osu! 資料',
      aliases: ['u'],
      options: [{
        type: ApplicationCommandOptionType.String,
        name: '玩家',
        description: '要查詢的玩家 ID 或名稱',
        required: true
      }, {
        type: ApplicationCommandOptionType.Number,
        name: '遊戲模式',
        description: '要查詢的遊戲模式',
        required: false,
        choices: [
          { name: 'standard', value: 0 },
          { name: 'taiko', value: 1 },
          { name: 'catch', value: 2 },
          { name: 'mania', value: 3 },
        ]
      }]
    });
  }

  public async execute(source: Source, [player, mode]: [string, number]): Promise<void> {
    const gameMode = mode ? mode as GameMode : GameMode.Standard;

    const [user] = await source.client.osu.users
      .getUser({ user: player, gameMode })
      .catch(() => []);

    if (!user) {
      await source.defer({ ephemeral: true });
      await source.update({ content: `我已經盡力了，但仍找不到 ${player} 這位玩家`, allowedMentions: { parse: [] } });
      return;
    }

    await source.defer();

    const {
      username, pp, rank, country, countryRank, level, accuracy, playcount,
      scoreRankCount: { ssh, ss, sh, s, a }
    } = user;
    const helper = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的 osu! 中心')
      .setThumbnail(user.avatarURL())
      .addFields([
        { name: '玩家', value: `[${username}](${user.profileURL()})` },
        { name: 'SS總數', value: `${ssh + ss}`, inline: true },
        { name: 'SS+', value: `${ssh || 0}`, inline: true },
        { name: 'SS', value: `${ss || 0}`, inline: true },
        { name: 'S總數', value: `${sh + s}`, inline: true },
        { name: 'S+', value: `${sh || 0}`, inline: true },
        { name: 'S', value: `${s || 0}`, inline: true },
        { name: 'A總數', value: `${a || 0}` },
        { name: '等級', value: `${~~(level)}`, inline: true },
        { name: '總遊玩次數', value: `${playcount || 0}`, inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: 'pp', value: `${pp || 0}`, inline: true },
        { name: '世界排名', value: `${rank || '無'}`, inline: true },
        { name: `地區（${country}）排名`, value: `${countryRank || '無'}`, inline: true },
        { name: '準確率', value: `${~~(accuracy * 1000) / 1000}%` }
      ]);
    await source.update({ embeds: [helper] });
  }
}
