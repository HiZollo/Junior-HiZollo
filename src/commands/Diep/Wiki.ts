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
import { CommandType } from "../../utils/enums";

export default class DiepWiki extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Information, 
      parent: 'diep', 
      name: 'wiki', 
      description: '取得 Diep.io 繁中維基的連結'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update('Diep.io 繁中維基是個好地方\nhttps://diepio.fandom.com/zh');
  }
}