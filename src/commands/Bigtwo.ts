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

import { DjsBigTwo } from "@hizollo/games";
import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { bigTwo as strings } from "../features/json/gameString.json";
import { CommandOptionType, CommandType } from "../utils/enums";

export default class Bigtwo extends Command<[GuildMember, GuildMember, GuildMember]> {
  constructor() {
    super({ 
      type: CommandType.MultiPlayerGame, 
      name: 'bigtwo', 
      description: '開啟一場四人的大老二遊戲', 
      extraDescription:
        `**遊戲規則：**\n`+
        `這是一個一般的大老二遊戲，四個玩家輪流出牌，最先把牌打完的就獲勝\n`+
        `能夠打出的牌組有單張、對子、葫蘆、順子、鐵支、同花順共 6 種\n`+
        `當一種牌組被打出後，後續的玩家只能出相同種類，而且牌面較大的牌組，但有幾個例外\n`+
        `第一，鐵支可以壓過任意單張、對子、葫蘆與順子；第二，同花順可以壓過其他 5 種牌組\n`+
        `在比較兩張牌的大小時，會先比數字，其順序為：2 > A > K > Q > J > 10 > ... > 3\n`+
        `順序相同時再比的就是花色，其順序為：\\♠ > \\♥ > \\♦ > \\♣\n`+
        `相同種類的牌組比大小時，大部分都是以牌組中順位最大的牌為決勝牌，除了以下例外：\n`+
        `(1) A-2-3-4-5 順子的決勝牌是 5\n`+
        `(2) 所有葫蘆的決勝牌是以三張一組的數字，如 3-3-3-5-5 的決勝牌是最大的 3\n`+
        `要查看你自己的手牌，你需要點擊「顯示手牌」按鈕，隨後就會出現一則只有你看得到的訊息，上面就有你的手牌\n`+
        `同時，在那則訊息上還會有一個選單，讓你選擇接下來要打出的牌組\n`+
        `選擇完畢後，輪到你時你再按下「出牌」即可打出牌組，當然你也可以按下「跳過」來跳過你的回合\n`+
        `一個玩家的思考時間有 2 分鐘，超過這個時間就會自動輪到下一位玩家出牌`,
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
        required: true
      }, {
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '對手3', 
        description: '指定你的對手', 
        required: true
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages]
      }
    });
  }

  public async execute(source: Source, [player1, player2, player3]: [GuildMember, GuildMember, GuildMember]): Promise<void> {
    const playerOptions = [source.user, ...[player1, player2, player3].filter(a => a != null).map(m => m.user)]
      .map(({ username, id, bot }) => ({ username, id, bot }))
      .filter((user, i, arr) => i === arr.findIndex(u => u.id === user.id));
    
    if (playerOptions.length !== 4) {
      await source.defer({ ephemeral: true });
      await source.update(`你需要指定剛好 3 位伺服器中的成員作為對手`);
      return;
    }
    if (playerOptions.find(u => u.id === source.client.user?.id)) {
      await source.defer({ ephemeral: true });
      await source.update(`我不會玩大老二，你去找別人玩比較快`);
      return;
    }
    if (playerOptions.some(u => u.bot && u.id !== source.client.user?.id)) {
      await source.defer({ ephemeral: true });
      await source.update(`我都不會大老二了，憑什麼其他機器人會`);
      return;
    }

    const game = new DjsBigTwo({
      players: playerOptions, 
      source: source.source, 
      time: 120e3, 
      strings: strings
    });

    await game.initialize();
    await game.start();
    await game.conclude();
  }
}