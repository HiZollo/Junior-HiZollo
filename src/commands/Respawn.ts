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
import { ApplicationCommandOptionType } from "discord.js";

export default class Respawn extends Command<[number]> {
  constructor() {
    super({ 
      type: CommandType.Developer, 
      name: 'respawn', 
      description: '重新生成所有分支', 
      aliases: ['rsp'], 
      options: [{
        type: ApplicationCommandOptionType.Number, 
        name: '分支', 
        description: '要重生的分支 ID', 
        required: false
      }]
    });
  }

  public async execute(source: Source, [shardId]: [number]): Promise<void> {
    await source.hide();

    if (shardId === null) {
      await source.update(`已開始重生所有分支`);
      await source.client.shard?.respawnAll();
    }
    else {
      await source.update(`已開始重生 ${shardId} 號分支`);
      source.client.shard!.broadcastEval((client, { shardId }) => {
        if (client.shard!.ids.includes(shardId)) process.exit();
      }, { context: { shardId } });
    }
  }
}