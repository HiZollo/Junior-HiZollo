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

import { DjsBullsAndCows } from "@hizollo/games";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { bullsAndCows as strings } from "../features/json/gameString.json";
import { CommandType } from "../typings/enums";

export default class Bullsandcows extends Command<[boolean]> {
  constructor() {
    super({ 
      type: CommandType.SinglePlayerGame, 
      name: 'bullsandcows', 
      description: '開啟一場猜 AB 遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `HiZollo 會隨機產生一個四位數字，這四個數字一定不會重複，而且有可能以 0 開頭）\n`+
        `你每次可以輸入一個四位數字（數字需互不重複），而 HiZollo 會給你一個 「nAmB」的提示\n`+
        `「nA」代表的是你有 n 個數字猜對了，且這些數字都在正確的位置上\n`+
        `「mB」則代表你有 m 個數字猜對了，但這些數字的位置是不正確的\n`+
        `請運用你的智慧，在 HiZollo 的提示下，試著以最少次的猜測來猜中正確答案\n`+
        `注意當閒置超過 2 分鐘後，遊戲會直接結束\n`+
        `**注意：**\n`+
        `在普通模式下，你的猜測以及 HiZollo 給的提示都會被保留，但在困難模式下只會保留最後一則提示`,
      aliases: ['bac', 'guessab', 'ga'], 
      options: [{
        type: ApplicationCommandOptionType.Boolean, 
        name: '困難模式', 
        description: '是否開啟困難模式', 
        required: false
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [hardMode]: [boolean]): Promise<void> {
    const game = new DjsBullsAndCows({
      players: [source.user], 
      hardMode: hardMode ?? false, 
      source: source.source, 
      time: 60e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}
