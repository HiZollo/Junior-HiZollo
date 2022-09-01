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

import { DjsGomoku } from "@hizollo/games";
import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { gomoku as strings } from "../features/json/gameString.json";
import { CommandOptionType, CommandType } from "../utils/enums";

const symbols = ['🔵', '🔴', '🟢'];

export default class Gomoku extends Command<[GuildMember, GuildMember]> {
  constructor() {
    super({ 
      type: CommandType.MultiPlayerGame, 
      name: 'gomoku', 
      description: '開啟一場 13 路五子棋遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `遊戲中的玩家會輪流下棋，使用指令者為先手（${symbols[0]}），其餘玩家（${symbols[1]}、${symbols[2]}）會依照指令輸入的順序下棋\n`+
        `第一個將自己的五顆棋子連成一直線（直、橫、對角線都可以）的玩家獲勝\n`+
        `當你決定好你的落子位置時，你要先往上對應英文，再往左對應數字，並在頻道輸入該格子的對應編號來下棋，如 \`a3\` 或 \`g12\`\n`+
        `注意當其中一名玩家閒置超過 2 分鐘時，就會視為棄子，如果所有玩家都棄子，遊戲會直接結束`,
      aliases: ['gmk'], 
      options: [{
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '對手1', 
        description: '指定你的對手', 
        required: true
      }, {
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '對手2', 
        description: '指定你的對手', 
        required: false
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.ViewChannel]
      },
    });
  }

  public async execute(source: Source, [player1, player2]: [GuildMember, GuildMember]): Promise<void> {
    const playerOptions = [source.user, ...[player1, player2].filter(a => a != null).map(m => m.user)]
      .map(({ username, id, bot }) => ({ username, id, bot }))
      .filter((user, i, arr) => i === arr.findIndex(u => u.id === user.id))
      .map((p, i) => ({ symbol: symbols[i], ...p }));
    
    if (playerOptions.length <= 1) {
      await source.defer({ ephemeral: true });
      await source.update(`請至少指定這個伺服器中的一名玩家作為對手`);
      return;
    }
    if (playerOptions.find(u => u.id === source.client.user?.id)) {
      await source.defer({ ephemeral: true });
      await source.update(`我還不會五子棋，也許你可以找伺服器上的其他人玩`);
      return;
    }
    if (playerOptions.some(u => u.bot && u.id !== source.client.user?.id)) {
      await source.defer({ ephemeral: true });
      await source.update(`我都不會五子棋了，你覺得其他機器人會嗎`);
      return;
    }

    const game = new DjsGomoku({
      players: playerOptions, 
      boardSize: 13, 
      source: source.source, 
      time: 120e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}