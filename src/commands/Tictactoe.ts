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

import { DjsTicTacToe } from "@hizollo/games";
import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ticTacToe as strings } from "../features/json/gameString.json";
import { CommandOptionType, CommandType } from "../utils/enums";

export default class TicTacToe extends Command<[GuildMember, number]> {
  constructor() {
    super({ 
      type: CommandType.MultiPlayerGame, 
      name: 'tictactoe', 
      description: '開啟一場圈圈叉叉遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        '簡單的圈圈叉叉，你的目標是比對手先將自己的棋子連成三顆一線\n'+
        '開始遊戲後，可以棋盤上對應的位置按下按鈕來下棋，使用指令者為先手\n'+
        '注意當其中一名玩家閒置超過 30 秒時，就會視為棄子，如果兩位玩家都棄子，遊戲會直接結束\n',
      aliases: ['ttt'], 
      options: [{
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '對手', 
        description: '指定你的對手', 
        required: true
      }, {
        type: ApplicationCommandOptionType.Integer, 
        name: '棋盤大小', 
        description: '指定遊戲的棋盤大小', 
        required: false, 
        minValue: 1, 
        maxValue: 4
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages]
      }
    });
  }

  public async execute(source: Source, [opponent, boardSize]: [GuildMember, number]): Promise<void> {
    
    if (opponent.id === source.user.id) {
      await source.defer({ ephemeral: true });
      await source.update(`你也太邊緣了吧，要不要我陪你玩啊？`);
      return;
    }
    if (opponent.user.bot && opponent.id !== source.client.user?.id) {
      await source.defer({ ephemeral: true });
      await source.update(`你不能跟我以外的機器人對戰，因為它們都太爛了`);
      return;
    }

    const game = new DjsTicTacToe({
      players: [{
        username: source.user.username, 
        id: source.user.id, 
        bot: source.user.bot, 
        symbol: '❌'
      }, {
        username: opponent.user.username, 
        id: opponent.user.id, 
        bot: opponent.user.bot, 
        symbol: '⭕'
      }], 
      boardSize: boardSize ?? 3, 
      source: source.source, 
      time: 30e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}