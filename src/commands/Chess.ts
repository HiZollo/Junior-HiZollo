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

import { DjsChess } from "../classes/djsgames";
import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandOptionType, CommandType } from "../typings/enums";

const symbols = ['🔵', '🔴', '🟢'];

export default class Chess extends Command<[GuildMember, GuildMember]> {
  constructor() {
    super({ 
      type: CommandType.MultiPlayerGame, 
      name: 'chess', 
      description: '開啟一場西洋棋遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `TODO`,
      options: [{
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '對手', 
        description: '指定你的對手', 
        required: true
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.ViewChannel]
      },
    });
  }

  public async execute(source: Source, [opponent]: [GuildMember, GuildMember]): Promise<void> {
    const playerOptions = [source.user, opponent.user]
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
      await source.update(`我還不會西洋棋，也許你可以找伺服器上的其他人玩`);
      return;
    }
    if (playerOptions.some(u => u.bot && u.id !== source.client.user?.id)) {
      await source.defer({ ephemeral: true });
      await source.update(`我都不會西洋棋了，你覺得其他機器人會嗎`);
      return;
    }

    const game = new DjsChess({
      players: playerOptions, 
      source: source.source, 
      time: 120e3, 
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}
