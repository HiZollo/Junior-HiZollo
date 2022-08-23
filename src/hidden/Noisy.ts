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

import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Noisy extends HiddenCommand {
  constructor() {
    super('noisy');
  }

  public filter(message: Message): boolean {
    let content = message.content.toLowerCase();

    const hzs = [/junior hizollo/, /juniorhizollo/, /hizollo/];
    if (!hzs.some(h => h.test(content))) return false;
    for (const hz of hzs)
      if (hz.test(content)) {
        content = content.replace(hz, '');
        break;
      }

    const noisys = [/吵死了/, /真吵/, /超吵/, /有夠吵/];
    if (!noisys.some(h => h.test(content))) return false;
    for (const noisy of noisys)
      if (noisy.test(content)) {
        content = content.replace(noisy, '');
        break;
      }

    return /^ *$/.test(content);
  }


  public execute(message: Message): boolean {
    return this.epicResponse(message, ['QAQ'], ['我為什麼要憑空接受你的抱怨？你知道是你先說話我才會跟著說嗎？所以是你吵還是我吵？邏輯已死？']);
  }
}