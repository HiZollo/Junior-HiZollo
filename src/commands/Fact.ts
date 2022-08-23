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
import * as Facts from "../features/facts";
import randomElement from "../features/utils/randomElement";
import { CommandType } from "../utils/enums";

export default class Fact extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'fact', 
      description: '讓博學多聞的我來告訴你天下大小事', 
      extraDescription: '不填參數時會從所有分類中隨機挑選一個小知識', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '分類',
        description: '要查看的特定分類',
        required: false,
        choices: [
          { name: '軼聞', value: 'anecdote' },
          { name: 'Discord', value: 'discord' },
          { name: '人類', value: 'human' },
          { name: 'HiZollo', value: 'hizollo' },
          { name: '數學', value: 'math' },
          { name: '自然', value: 'nature' },
          { name: '學科', value: 'subject' },
          { name: '世界', value: 'world' },
        ]
      }]
    });
  }

  public async execute(source: Source, [category]: [string]): Promise<void> {
    await source.defer();

    if (category) {
      const facts = this.getFacts(category);
      await source.update(randomElement(facts));
    }
    else {
      let allFacts: string[] = [];
      for (const facts of Object.values(Facts))
        allFacts = [...allFacts, ...facts];
      await source.update(randomElement(allFacts));
    }
  }

  private getFacts(category: string): string[] {
    category = this.categoryTable[category as keyof typeof this.categoryTable] ?? category
    category = category[0].toUpperCase() + category.substring(1);
    return Facts[category as keyof typeof Facts];
  }

  private categoryTable = {
    '軼聞': 'anecdote',
    'Discord': 'discord',
    '人類': 'human',
    'HiZollo': 'hizollo',
    '數學': 'math',
    '自然': 'nature',
    '學科': 'subject',
    '世界': 'world'
  }
}