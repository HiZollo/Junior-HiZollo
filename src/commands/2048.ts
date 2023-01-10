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

import { DjsTofe } from "@hizollo/games";
import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { tofe as strings } from "../features/json/gameString.json";
import { CommandType } from "../typings/enums";

export default class Tofe extends Command<[boolean]> {
  constructor() {
    super({ 
      type: CommandType.SinglePlayerGame, 
      name: '2048', 
      description: '開啟一場 2048 遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `在一個 4*4 的版面中會隨機出現 2、4、8 等 2 的次方數\n`+
        `你可以按下方向鍵按鈕來把這些數字往一個方向推動\n`+
        `如果在推動的方向上有兩個相同數字且他們相鄰，這兩個數字就會合併，合併後的數字會變為原本的兩倍\n`+
        `比如說 2 和 2 會合併成 4，而 4 和 4 會合併成 8\n`+
        `遊戲的目標是透過不斷合併數字來獲得 **2048**\n`+
        `如果在獲得 2048 以前版面就被填滿，而且沒有數字能被合併，那遊戲就宣告失敗\n`+
        `注意當遊戲閒置超過 30 秒時，遊戲會直接結束\n`+
        `**注意：**\n`+
        `在普通模式下，保證會存在至少一種推動/合併方塊的方法，但在困難模式下就沒有這個保證了`,
      aliases: ['tofe'], 
      options: [{
        type: ApplicationCommandOptionType.Boolean, 
        name: '困難模式', 
        description: '是否開啟困難模式', 
        required: false
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages]
      }
    });
  }

  public async execute(source: Source, [hardMode]: [boolean]): Promise<void> {
    const game = new DjsTofe({
      players: [source.user], 
      hardMode: hardMode ?? false, 
      source: source.source, 
      time: 30e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}
