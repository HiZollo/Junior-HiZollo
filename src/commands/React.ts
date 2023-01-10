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
import { CommandOptionType, CommandType } from "../typings/enums";

export default class React extends Command<[string]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'react', 
      description: '在前一則訊息上加入反應', 
      aliases: ['r'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        parseAs: CommandOptionType.Emoji, 
        name: '表情', 
        description: '要附加在前一則反應上的表情', 
        required: true
      }], 
      permissions: {
        bot: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel], 
        user: [PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [emoji]: [string]): Promise<void> {
    const messages = await source.channel?.messages.fetch({ limit: source.isChatInput() ? 1 : 2 }).catch(() => {});
    const message = messages?.first(-1)[0];

    await source.hide();

    if (!message) {
      await source.temp(`我找不到上一則訊息欸，可不可以再確認一下`);
      return;
    }

    message.react(emoji).then(async () => {
      await source.editReply(`已成功反應表情 ${emoji}`);
    }).catch(async () => {
      await source.temp(`反應表情失敗，可能是因為這個表情不存在，或是上一則訊息的反應已經滿了`);
    });
  }
}
