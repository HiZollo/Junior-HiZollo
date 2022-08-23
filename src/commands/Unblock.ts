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

import { ApplicationCommandOptionType, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Unblock extends Command<[User]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'unblock', 
      description: '將一位使用者暫時性的解除全域封鎖，但在機器人下線後名單會被重置', 
      options: [{ 
        type: ApplicationCommandOptionType.User, 
        name: '使用者', 
        description: '要解封的使用者', 
        required: true
      }]
    });
  }

  public async execute(source: Source, [user]: [User]): Promise<void> {
    await source.defer();
    await source.client.shard?.broadcastEval((client, { userId }) => {
      client.unblock(userId);
    }, { context: { userId: user.id } })
    await source.update(`已成功暫時解除 ${user} 的全域封鎖`);
  }
}