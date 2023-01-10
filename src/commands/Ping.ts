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
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";

export default class Ping extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'ping', 
      description: '敲一下我的大腿看我的反應時間'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const message = await source.update('計算中……');
    const ping = message.createdTimestamp - source.createdTimestamp;
    await message.edit(`:information_source:｜Pong！機器人延遲為：${ping}ms，API 延遲為：${source.client.ws.ping}ms`);
  }
}
