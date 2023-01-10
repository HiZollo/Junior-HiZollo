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

import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomElement from "../features/utils/randomElement";
import { CommandType } from "../typings/enums";

export default class Choose extends Command<string[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'choose', 
      description: '讓我來拯救你的選擇困難症', 
      options: [{ 
        type: ApplicationCommandOptionType.String, 
        name: '選項%i', 
        description: '要抽出的選項', 
        required: false, 
        repeat: true
      }]
    });
  }

  public async execute(source: Source, options: string[]): Promise<void> {
    options = options.filter(o => o != null);

    if (options.length < 2) {
      await source.defer({ ephemeral: true });
      await source.update('請給我兩個以上的選項，不然我是要怎麼選');
      return;
    }

    const option = randomElement(options);
    await source.defer();
    await source.update(randomElement(this.replys).replace('<>', option));
  }

  private replys = [
    '我選 <>', '我的話會選 <>', '我想選 <>' ,  '我選擇 <>', '選 <> 好了',
    '<>，我選這個', '<>，如何', '也許 <> 是 ok 的', '<>？', '我認為 <> 是最好的',
    '<> 好像比較好，你覺得呢？', '<> 吧'
  ];
}
