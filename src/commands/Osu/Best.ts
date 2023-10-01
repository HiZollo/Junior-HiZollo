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
import { CommandType, PageSystemMode } from "../../typings/enums";
import { APIEmbedField, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import pageSystem from "../../features/utils/pageSystem";
import { ScoreRank, ModsBitField, ModsAbbreviation, GameMode } from "@hizollo/osu-api";

export default class OsuBest extends Command<[string, number]> {
  constructor() {
    super({
      type: CommandType.Information,
      parent: 'osu',
      name: 'best',
      description: '取得一名玩家在 osu! 上最高成績的資料',
      aliases: ['bp'],
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

    const scores = await source.client.osu.users
      .getUserBest({ user: player, mode: gameMode })
      .catch(() => []);

    if (!scores.length) {
      await source.defer({ ephemeral: true });
      await source.update({ content: `我已經盡力了，但仍找不到 ${player} 這位玩家`, allowedMentions: { parse: [] } });
      return;
    }

    const user = (await scores[0].getPlayer())!;
    const beatmaps = await Promise.all(scores.map(score => score.getBeatmap()))

    await source.defer();
    const message = await source.update('清單製作中……');

    const fields: APIEmbedField[][] = [];
    const thumbnails: (string | null)[] = [];

    scores.forEach((score, i) => {
      const { title, difficulty: { rating }, maxCombo } = beatmaps[i];
      const {
        score: scoring, rank, perfect, accuracy, pp,
        statistics: { countMiss }, maxCombo: maxComboAchieve
      } = score;

      const field: APIEmbedField[] = [
        { name: '玩家', value: `[${user.username}](${user.profileURL()})` },
        { name: '譜面名稱', value: `[${title}](${beatmaps[i].beatmapURL()})` },
        { name: '難度', value: `${~~(rating * 100) / 100}` },
        { name: '分數', value: `${scoring}`, inline: true },
        { name: '等第', value: ScoreRank[rank].replace('H', '+').replace('X', 'SS'), inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: 'Combo', value: `${maxComboAchieve}/${maxCombo} ${perfect ? '[FC] ' : countMiss === 0 ? '[No Miss]' : ''}`, inline: true },
        { name: '準確率', value: accuracy ? `${~~(accuracy * 10000) / 100}%` : '查無資訊', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
      ];
      if (pp) field.push({ name: 'pp', value: `${pp}` });
      field.push({ name: 'Mods', value: this.modResolve(score.enabledMods).join(' ') });

      fields.push(field);
      thumbnails.push(beatmaps[i].coverThumbnailURL());
    });

    const helper = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 的 osu! 中心');

    if (source.isMessage()) {
      await message.delete().catch(() => { });
    }

    await pageSystem({
      mode: PageSystemMode.EmbedField,
      source: source,
      pages: fields,
      embed: helper,
      thumbnails: thumbnails,
      contents: {
        exit: '玩家資料已關閉',
        idle: '玩家資料已因閒置超過 30 秒而關閉'
      }
    });
  }

  private modResolve(mods: ModsBitField): string[] {
    if (mods.isNone()) return ['-'];
    return mods
      .toArray()
      .filter((name, _, arr) => {
        if (name === "DoubleTime" && arr.includes("Nightcore")) return false;
        if (name === "SuddenDeath" && arr.includes("Perfect")) return false;
        return true;
      })
      .map(name => ModsAbbreviation[name as keyof typeof ModsAbbreviation])
      .filter(v => v);
  }
}
