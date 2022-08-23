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

export default class Lanbot extends HiddenCommand {
  constructor() {
    super('lanbot');
  }

  private lans = ['爛bot', '超爛bot'];
  public filter(message: Message): boolean {
    return this.lans.includes(message.content);
  }

  private r1 = ['我才不是爛 bot', '嗚嗚', 'QAQ', '......', '你叫誰爛 bot 啊'];
  private r2 = ['是 JavaScript 爛，不是我', '你才比較爛吧', '是開發我的人爛'];
  private r3 = [{ files: ['./src/pictures/badbot.jpg'] }];

  public execute(message: Message): boolean {
    return this.randomResponse(message, this.r1, this.r2, this.r2, this.r2, this.r3);
  }
}