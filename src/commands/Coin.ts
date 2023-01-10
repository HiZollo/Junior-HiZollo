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

import { PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomInt from "../features/utils/randomInt";
import { CommandType } from "../typings/enums";

export default class Coin extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'coin', 
      description: '讓我幫你丟一枚硬幣',
      permissions: {
        bot: [PermissionFlagsBits.AttachFiles],
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const message = await source.update('你把一枚硬幣丟到了桌上……');
    const n = randomInt(1, 100);
    let content = '', url = './src/pictures/';
    if (n <= 48) {
      content = '你丟出了正面！';
      url += 'coin-head.png';
    } else if (n <= 96) {
      content = '你丟出了反面！';
      url += 'coin-tail.png';
    } else if (n <= 97) {
      content = '等等，硬幣立了起來';
      url += 'coin-stand.png';
    } else if (n <= 98) {
      content = '欸不是，硬幣跑到哪裡去了'
      url += 'coin-disappear.png';
    } else {
      content = '哇！變成了一百塊！你是怎麼做到的？';
      url += 'coin-hundred.png';
    }
    setTimeout(async () => {
      await message.edit({
        content: content,
        files: [{ attachment: url, name: 'coin.png' }]
      });
    }, 1900);
  }
}
