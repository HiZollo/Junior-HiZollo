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

export default class Deletemsg extends Command<[number]> {
  constructor() {
    super({
      type: CommandType.Utility,
      name: 'deletemsg',
      description: `在指定時間後刪除此指令的前一則訊息`,
      options: [{
        type: ApplicationCommandOptionType.Number,
        name: '時間',
        description: '多久後刪除訊息，單位為秒',
        required: true,
        minValue: 1,
        maxValue: 120
      }],
      permissions: {
        bot: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel],
        user: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [time]: [number]): Promise<void> {
    const messages = await source.channel?.messages.fetch({ limit: source.isChatInput() ? 1 : 2 }).catch(() => { });
    const message = messages?.first(-1)[0];

    await source.hide();

    if (!message) {
      await source.temp(`我找不到上一則訊息欸，可不可以再確認一下`);
      return;
    }
    if (!message?.deletable) {
      await source.temp('我無法刪除這則訊息');
      return;
    }

    setTimeout(async () => {
      await message.delete().catch(() => { });
      await source.temp('已刪除指定訊息');
    }, time * 1000);
  }
}
