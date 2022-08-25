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
import randomElement from "../features/utils/randomElement";
import { CommandType } from "../utils/enums";

export default class Think extends Command<[string]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'think', 
      description: '讓我幫你送出一個 thinking 表情符號', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '表情', 
        description: '指定一種要送出的🤔', 
        required: false, 
        choices: Object.keys(thinks).map(choice => ({ name: choice, value: choice }))
      }], 
      permissions: {
        bot: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.ViewChannel], 
        user: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [think]: [string]): Promise<void> {
    await source.hide();

    if (!think) {
      const array = Object.keys(thinks);
      think = randomElement(array);
    }

    await source.channel?.send(thinks[think as keyof typeof thinks]);
    await source.editReply(`${think} 傳送成功`);
  }
}

const thinks = Object.freeze({
  'normal': '🤔',
  'monocle': '🧐',
  '10': '<:think:856104264299708437>',
  'attano': '<:think:856104387234889729>',
  'distortion': '<:think:856105159162593300>',
  'super': '<:think:856104322701983755>',
  'thonk': '<:think:856104299892441089>',
  'hyper': '<:think:931860641742987356>',
  'rainbow': '<:think:931860642367938600>',
  'smile': '<:think:927122092451844147>',
  'sinking': '<:think:940233622399615036>',
  'blue': '<:think:927122090467930163>',
  'thong': '<:think:927125984984055809>',
  'jojo': '<:think:1012289387012304956>',
  'lazer': '<:think:1012289398555021483>'
});