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

import { ApplicationCommandOptionType, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Dmuser extends Command<[User, string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'dmuser', 
      description: 'DM 一位指定使用者', 
      options: [{
        type: ApplicationCommandOptionType.User, 
        name: '使用者',
        description: '要傳送到誰的 DM',
        required: true
      }, {
        type: ApplicationCommandOptionType.String, 
        name: '訊息', 
        description: '要傳送的訊息', 
        required: true
      }],
    });
  }

  public async execute(source: Source, [user, content]: [User, string]): Promise<void> {
    await source.defer();
    await user.send(new Function(`return \"${content}\"`)());
    await source.update('你的訊息已成功傳送');
  }
}
