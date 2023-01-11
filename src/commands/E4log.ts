/*
 * 
 * Copyright 2023 HiZollo Dev Team <https://github.com/hizollo>
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

import { ApplicationCommandOptionType, PermissionsBitField, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";

export default class E4log extends Command<[string, User]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'e4log', 
      description: '確認一位用戶是否有查看某一伺服器指令使用紀錄的資格', 
      aliases: ['e4l'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '伺服器',
        description: '伺服器的 ID',
        required: true
      }, { 
        type: ApplicationCommandOptionType.User, 
        name: '成員', 
        description: '要檢查的用戶', 
        required: true
      }] 
    });
  }

  public async execute(source: Source, [guildId, user]: [string, User]): Promise<void> {
    await source.defer();
    
    const guild = await source.client.guilds.fetch(guildId)
      .catch(() => {});

    if (!guild) {
      source.update('找不到伺服器，可能是因為我已經被退出了伺服器');
      return;
    }

    const member = await guild.members.fetch(user)
      .catch(() => {});

    if (!member) {
      source.update('找不到成員，可能是因為該成員不在所查詢的伺服器中');
      return;
    }

    const eligible = member.permissions.has(PermissionsBitField.Flags.ManageGuild);

    await source.update({
      content: `${eligible ? '✅' : '❌'} 用戶 ${member} ${eligible ? '有' : '沒有'}權限查看有關伺服器 ${guild} 的指令使用紀錄`, 
      allowedMentions: { parse: [] }
    });
  }
}

