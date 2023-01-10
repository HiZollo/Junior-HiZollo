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

import { ApplicationCommandOptionType, EmbedBuilder, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandOptionType, CommandType } from "../typings/enums";

export default class Userinfo extends Command<[GuildMember]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'userinfo', 
      description: '查看一位伺服器成員的資訊', 
      extraDescription: '不填參數時可以查看自己的資訊', 
      aliases: ['user'], 
      options: [{ 
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '成員', 
        description: '伺服器中的一位成員', 
        required: false
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source, [member]: [GuildMember]): Promise<void> {
    await source.defer();

    member = member ?? source.member;

    const { joinedTimestamp, id, nickname, roles } = member;
    const { bot, createdTimestamp, tag, username } = member.user;
    const sortedRoles = roles.cache
      .filter(role => role.name !== '@everyone')
      .sort((roleA, roleB) => -roleA.comparePositionTo(roleB));
    const rolesText = sortedRoles.size ? sortedRoles.first(40).join(', ') + `${sortedRoles.size > 40 ? ', ...' : ''}` : '無';

    const info = new EmbedBuilder()
      .applyHiZolloSettings(source.member, `使用者 ${tag} 的資訊`)
      .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 4096, forceStatic: false }))
      .addFields(
        { name: '使用者名稱', value: username, inline: true },
        { name: '在本伺服器暱稱', value: nickname ?? '無', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },

        { name: '使用者 ID', value: id, inline: true },
        { name: '是否為機器人', value: bot ? '是' : '否', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },

        { name: '帳戶創建時間', value: `<t:${~~(createdTimestamp/1000)}>`, inline: true },
        { name: '加入伺服器時間', value: joinedTimestamp ? `<t:${~~(joinedTimestamp/1000)}>` : '查無資訊', inline: true },
        { name: '\u200b', value: '\u200b', inline: true },

        { name: '擁有的身份組', value: rolesText }
      );

    await source.update({ embeds: [info] });
  }
}
