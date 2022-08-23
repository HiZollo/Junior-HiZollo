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

export default class Gg extends HiddenCommand {
  constructor() {
    super('gg');
  }

  public filter(message: Message): boolean {
    return message.content.toLowerCase() === 'gg';
  }

  private r1 = ['GG!', 'Gg!', 'gg!', 'GG'];
  private r2 = ['Gud Game!', 'Good Game!', 'Great Game'];
  private r3 = ['系統提示：您已獲得ㄐㄐ之力', 'ĞğġǴģg̃ĢĝǦĠᶃꬶḠḡǧǵƓɠǤĜǥꞠꞡG̃'];

  public execute(message: Message): boolean {
    return this.rareResponse(message, this.r1, this.r2, this.r3);
  }
}