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

import { ApplicationCommandOptionType, GuildMember, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import throwball from "../features/throw/throwball";
import { CommandOptionType, CommandType } from "../typings/enums";
import { ThrowBallType } from "../typings/types";

export default class Throwball extends Command<[GuildMember, string]> {
  constructor() {
    super({
      type: CommandType.Fun,
      name: 'throwball',
      description: '朝著一個人用力丟球',
      aliases: ['throw'],
      options: [{
        type: ApplicationCommandOptionType.User,
        parseAs: CommandOptionType.Member,
        name: '目標',
        description: '你要砸的人',
        required: true
      }, {
        type: ApplicationCommandOptionType.String,
        name: '球種',
        description: '你想要丟的球種',
        required: false,
        choices: [
          { name: '乒乓球', value: '乒乓球' }, { name: '巧克力球', value: '巧克力球' },
          { name: '棒球', value: '棒球' }, { name: '保齡球', value: '保齡球' }
        ]
      }],
      permissions: {
        bot: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        user: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [target, type]: [GuildMember, ThrowBallType]): Promise<void> {
    const member = source.member;
    if (!(member instanceof GuildMember)) {
      await source.defer({ ephemeral: true });
      await source.update('這個指令只能在伺服器中使用');
      return;
    }

    type = type ?? '棒球';
    await source.defer();
    if (target.id === source.client.user?.id)
      await source.update(`你把一顆${type}往我身上丟……`);
    else if (target.id === source.user.id)
      await source.update(`你把一顆${type}往你自己身上丟……`);
    else
      await source.update({
        content: `你把一顆${type}往 ${target.displayName} 身上丟……`
        , allowedMentions: { parse: [] }
      });

    setTimeout(async () => {
      const result = throwball(source.client, member, target, type);
      await source.channel?.send({ content: result, allowedMentions: { parse: [] } });
    }, 1900);
  }
}
