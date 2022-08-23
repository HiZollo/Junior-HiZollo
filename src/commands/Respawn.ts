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

import { Command } from "../classes/Command";
import { CommandType } from "../utils/enums";
import { Source } from "../classes/Source";

export default class Respawn extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Developer, 
      name: 'respawn', 
      description: '重新生成所有分支', 
      aliases: ['rsp']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.hide();
    await source.update('已開始重設所有分支');
    await source.client.shard?.respawnAll();
  }
}