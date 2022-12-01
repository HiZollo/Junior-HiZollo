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

import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ArgumentParseType, CommandType } from "../utils/enums";
import { EmbedBuilder } from 'discord.js';

export default class Say extends Command<[string]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'say', 
      description: '讓我代替你說一句話', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '訊息', 
        description: '要我代替你說的訊息', 
        required: true, 
        maxLength: 2000
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }, 
      permissions: {
        bot: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel], 
        user: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
      }
    });
  }

  public async execute(source: Source, [content]: [string]): Promise<void> {
    await source.hide();
    await source.channel?.send({
      content: content,
      allowedMentions: { parse: [] }
    });
    const logChannel = source.guild.channels.cache.find(v => v.name === 'hz-message-log');
    if(logChannel && logChannel.isTextBased() && !logChannel.isThread() && !logChannel.isVoiceBased()){
      logChannel.send({
        embeds: [new EmbedBuilder().setHiZolloColor().setDescription(`${source.user}在${source.channel}發送了信息：\n\`\`\`${content}\`\`\``)]
      });
    }
    await source.editReply('訊息已成功傳送');
  }
}