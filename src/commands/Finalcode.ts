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

import { DjsFinalCode } from "@hizollo/games";
import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { finalCode as strings } from "../features/json/gameString.json";
import { CommandOptionType, CommandType } from "../utils/enums";

export default class FinalCode extends Command<GuildMember[]> {
  constructor() {
    super({ 
      type: CommandType.MultiPlayerGame, 
      name: 'finalcode', 
      description: '開啟一場終極密碼遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `HiZollo 會產生一個 1 到 1000 之間的終極密碼，而遊戲的目標是猜出這個數字\n`+
        `在每一回合玩家需要給出一個數字，HiZollo 會告訴你這個數字太大還是太小\n`+
        `每個玩家只有 15 秒的時間給出猜測，只要有人猜出正確的終極密碼，遊戲就會結束\n`+
        `如果想要停止遊戲，可以按下按鈕來要求停止，只要所有玩家都停止遊戲，遊戲也會結束`,
      aliases: ['fc'], 
      options: [{
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '對手%i', 
        description: '指定你的對手', 
        required: false, 
        repeat: true
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, players: GuildMember[]): Promise<void> {
    const playerOptions = [source.user, ...players.filter(a => a != null).map(m => m.user)]
      .map(({ username, id, bot }) => ({ username, id, bot }))
      .filter((user, i, arr) => i === arr.findIndex(u => u.id === user.id));
    
    if (playerOptions.some(u => u.bot && u.id !== source.client.user?.id)) {
      await source.defer({ ephemeral: true });
      await source.update(`你不能找我以外的機器人玩這個遊戲，因為他們都太爛了`);
      return;
    }

    const game = new DjsFinalCode({
      players: playerOptions, 
      source: source.source, 
      time: 15e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}