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

import { DjsLightsUp } from "@hizollo/games";
import { PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { lightsUp as strings } from "../features/json/gameString.json";
import { CommandType } from "../utils/enums";

export default class Lightsup extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.SinglePlayerGame, 
      name: 'lightsup', 
      description: '開啟一場點燈遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `HiZollo 會給出有 5*5 個燈泡的盤面，每個燈泡可能是亮（藍色）或暗（灰色）\n`+
        `當你按下某個燈泡時，該燈泡及其上下左右的燈泡都會亮暗交替\n`+
        `遊戲目標是要把全部的燈泡都點亮（全藍）\n`+
        `注意當遊戲閒置超過 30 秒時，遊戲會直接結束`,
      aliases: ['lu'], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    const game = new DjsLightsUp({
      players: [source.user], 
      source: source.source, 
      time: 30e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}