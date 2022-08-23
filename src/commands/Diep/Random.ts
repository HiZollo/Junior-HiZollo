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

import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import randomElement from "../../features/utils/randomElement";
import { info } from "../../features/json/diepRandomInfo.json";
import { CommandType } from "../../utils/enums";
import { ApplicationCommandOptionType } from "discord.js";

export default class DiepInfo extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      parent: 'diep', 
      name: 'random', 
      description: '隨機抽取一台 Diep.io 的坦克', 
      aliases: ['rt'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '類別',
        description: '要選擇的坦克類別',
        required: false,
        choices: [
          { name: '一般坦克', value: 'normal' }, { name: '特殊坦克', value: 'special' }, { name: '已移除坦克', value: 'removed' }
        ]
      }]
    });
  }

  public async execute(source: Source, [category]: [string]): Promise<void> {
    await source.defer();
    const assignedTanks = category ? info.filter(tank => tank.category === category) : info;
    const { name, link, id } = randomElement(assignedTanks);
    await source.update(`本次隨機抽取出的坦克是 ID 為 ${id} 的 ${name}\n詳細資訊：<${'https://diepio.fandom.com/zh/wiki/'+link}>`);
  }
}