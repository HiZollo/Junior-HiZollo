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
import config from "@root/config";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Wronghelp extends HiddenCommand {
  constructor() {
    super('wronghelp');
  }

  public filter(message: Message): boolean {
    let {content} = message;
    if (!content.startsWith(config.bot.prefix)) return false;
    content = content.slice(config.bot.prefix.length);

    if (content === 'help') return false;
    if (/^[hygjn][e3wrd][lok;\.][p0o\[;]$/.test(content)) return true;
    if (content.length !== 4) return false;
    return content.split('').sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0)).join('') === 'ehlp';
  }


  public execute(message: Message): boolean {
    message.channel.send('在尋求幫助時請先確定你會拼英文單字');
    return true;
  }
}