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

import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ArgumentParseType, CommandType } from "../utils/enums";

export default class Vote extends Command<string[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'vote', 
      description: '讓我幫你發起一場投票', 
      options: [{ 
        type: ApplicationCommandOptionType.String, 
        name: '主題', 
        description: '投票的主題', 
        required: true
      }, {
        type: ApplicationCommandOptionType.String, 
        name: '選項%i', 
        description: '投票的選項', 
        required: false, 
        repeat: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.Quote, 
        quotes: ['`', '`']
      }, 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source, [topic, ...options]: string[]): Promise<void> {
    const alphabets = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹'];
    options = options.filter(a => a != null)
      .filter((option, i, arr) => i === arr.findIndex(o => o === option))
      .map((o, i) => `${alphabets[i]} ${o}`);
    
    if (options.length < 2) {
      await source.defer({ ephemeral: true });
      await source.update('你需要提供至少兩個不重複的選項');
      return;
    }
    if (options.length > 20) {
      await source.defer({ ephemeral: true });
      await source.update('選項的數量不能超過 20 個');
      return;
    }
    
    await source.defer();
    const nowTime = Math.trunc(Date.now() / 1000);

    const helper = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的投票中心')
      .setDescription(options.join('\n') + `\n\n${source.member} 在 <t:${nowTime}> 發起的投票`)
      .setTitle(topic);

    await source.update({ embeds: [helper] }).then(async msg => {
      for (var i = 0; i < options.length; i++)
        await msg.react(alphabets[i]);
    });
  }
}