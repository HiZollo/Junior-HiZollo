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

import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";

export default class Purge extends Command<[number]> {
  constructor() {
    super({
      type: CommandType.Utility,
      name: 'purge',
      description: '刪除頻道中指定數量的訊息',
      options: [{
        type: ApplicationCommandOptionType.Integer,
        name: '數量',
        description: '要刪除的訊息數量',
        required: true,
        minValue: 1,
        maxValue: 99
      }],
      permissions: {
        bot: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel],
        user: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [number]: [number]): Promise<void> {
    await source.hide();

    if (!source.channel || !('bulkDelete' in source.channel)) {
      await source.temp('此指令需要在伺服器的頻道裡才可以使用');
      return;
    }
    await source.channel?.bulkDelete(number, true);
    await source.temp(`已刪除 ${source.channel} 中最近的 ${number} 條訊息`);
  }
}
