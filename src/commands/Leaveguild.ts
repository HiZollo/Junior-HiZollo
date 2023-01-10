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

import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import yesNoSystem from "../features/utils/yesNoSystem";
import { CommandType } from "../typings/enums";

export default class Leaveguild extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'leaveguild', 
      description: '退出指定的伺服器', 
      aliases: ['lg'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '伺服器',
        description: '要退出伺服器的 ID',
        required: true
      }]
    });
  }

  public async execute(source: Source, [guildId]: [string]): Promise<void> {
    const results = await source.client.shard?.broadcastEval(async (client, { guildId }) => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) return;
      return { id: guild.id, name: guild.name, shardId: client.shard?.ids[0] }
    }, { context: { guildId } });

    const guild = results?.find(e => e);

    if (!guild || guild.shardId == null) {
      await source.defer({ ephemeral: true });
      await source.update('我找不到這個伺服器');
      return;
    }

    await source.defer();
    const helper = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的伺服器中心')
      .setDescription(`你真的確定要退出 ${guild.name} 嗎？`);
    
    const answer = await yesNoSystem({
      source: source,
      messageOptions: { embeds: [helper] },
      labels: ['確定', '取消'], 
      contents: {
        idle: '你猶豫太久了！請再試一次'
      }
    });

    if (answer) {
      await source.client.shard?.broadcastEval<void, {guildId: string}>((client, {guildId}) => {
        client.guilds.cache.get(guildId)?.leave();
      }, { context: { guildId }, shard: guild.shardId });
      helper.setDescription(`已退出 ${guild.name}`);
    }
    else {
      helper.setDescription(`好，我會繼續留在 ${guild.name}`);
    }

    await source.channel?.send({ embeds: [helper] });
  }
}
