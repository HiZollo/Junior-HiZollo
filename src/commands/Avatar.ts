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

import { ApplicationCommandOptionType, GuildMember, PermissionsBitField } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import removeMd from "../features/utils/removeMd";
import { CommandOptionType, CommandType } from "../typings/enums";

export default class Avatar extends Command<[GuildMember]> {
  constructor() {
    super({
      type: CommandType.Utility,
      name: 'avatar',
      description: '查看一位伺服器成員的頭像',
      extraDescription: '不填參數時可以查看自己的頭像',
      aliases: ['av'],
      options: [{
        type: ApplicationCommandOptionType.User,
        parseAs: CommandOptionType.Member,
        name: '成員',
        description: '伺服器中的成員',
        required: false
      }],
      permissions: {
        bot: [PermissionsBitField.Flags.AttachFiles]
      }
    });
  }

  public async execute(source: Source, [member]: [GuildMember]): Promise<void> {
    await source.defer();
    member ??= source.member;

    const name = source.user.id === member.id ? '你' : source.client.user?.id === member.id ? '我' : ` ${removeMd(member.displayName)} `;
    await source.update({
      content: `以下是${name}的頭像`,
      files: [{
        attachment: member.displayAvatarURL({ extension: 'png', size: 4096 }),
        name: 'avatar.png'
      }],
      allowedMentions: { parse: [] }
    });
  }
}
