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

import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ArgumentParseType, CommandType } from "../utils/enums";

export default class Repeat extends Command<[string]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'repeat', 
      description: '讓我複讀一句話', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '訊息', 
        description: '要我複讀的訊息', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }
    });
  }

  public async execute(source: Source, [content]: [string]): Promise<void> {
    await source.defer();
    await source.update({
      content: content,
      allowedMentions: { parse: [] }
    });
  }
}