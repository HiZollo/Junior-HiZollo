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

export default class Lagbot extends HiddenCommand {
  constructor() {
    super('lagbot');
  }

  private lags = ['真慢', '有夠慢', '慢欸', '慢死了', '太慢了吧', 'lag bot', 'laggy bot'];
  public filter(message: Message): boolean {
    return this.lags.includes(message.content);
  }

  private r1 = ['我有什麼辦法啊', '啊我也沒辦法啊', '我能怎麼辦', '啊我能怎樣', '阿所以呢', 'QAQ', '整天只會抱怨不然你來弄嘛，不會弄就不要出一張嘴'];
  private r2 = ['所以要怎麼辦', '我沒辦法，你有辦法嗎？'];
  private r3 = ['你確定不是你那邊的問題嗎', '你確定你網路沒問題嗎'];

  public execute(message: Message): boolean {
    return this.randomResponse(message, this.r1, this.r2, this.r3);
  }
}
