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
import { CommandType } from "../typings/enums";
import toShuffled from "../features/utils/toShuffled";

const optionChoices: { name: string, value: keyof typeof Facts }[] = [
  { name: '軼聞', value: 'Anecdote' },
  { name: '電腦', value: 'Computer' },
  { name: 'Discord', value: 'Discord' },
  { name: 'HiZollo', value: 'Hizollo' },
  { name: '人類', value: 'Human' },
  { name: '數學', value: 'Math' },
  { name: '自然', value: 'Nature' },
  { name: '實用', value: 'Useful' },
  { name: '世界', value: 'World' },
];

export default class Fact extends Command<[keyof typeof Facts]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'fact', 
      description: '讓博學多聞的我來告訴你天下大小事', 
      aliases: ['trivia'], 
      extraDescription: '不填參數時會從所有分類中隨機挑選一個小知識', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '分類',
        description: '要查看的特定分類',
        required: false,
        choices: optionChoices
      }]
    });
  }

  public async execute(source: Source, [category]: [keyof typeof Facts]): Promise<void> {
    await source.defer();
    await source.update(category ? this.getRandomFrom(category) : this.getRandom());
  }

  private bags = new Map<keyof typeof Facts, string[]>(
    Object.entries(Facts).map(([k, v]) => [k as keyof typeof Facts, toShuffled(v)])
  );

  private getRandomFrom(category: keyof typeof Facts) {
    let bag = this.bags.get(category);
    if (!bag || !bag.length) {
      bag = toShuffled(Facts[category]);
      this.bags.set(category, bag);
    }
    return bag.shift()!;
  }

  private getRandom() {
    const categories = [...this.bags.entries()].map(([k, v]) => Array<keyof typeof Facts>(v.length).fill(k)).flat();
    const category = randomElement(categories);
    return this.getRandomFrom(category);
  }
}
