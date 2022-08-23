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

export default class Thanks extends HiddenCommand {
  constructor() {
    super('thanks');
  }

  public filter(message: Message): boolean {
    return message.content.startsWith('???') &&
      (('name' in message.channel && message.channel?.name == '釣魚拉霸室') || message.channel.isTestChannel());
  }


  public execute(message: Message): boolean {
    message.channel.send(
      '==========[祈福]========== \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n' +
      '           !!!!!!!!!感謝上天恩賜!!!!!!!!!  \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    );
    return true;
  }
}