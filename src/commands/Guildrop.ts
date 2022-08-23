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

import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, Message, TextChannel } from "discord.js";
import constant from "../constant.json";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType, PageSystemMode } from "../utils/enums";
import removeMd from "../features/utils/removeMd";
import pageSystem from "../features/utils/pageSystem";

type GuildInfo = { name: string, id: string };

export default class Guildrop extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Network, 
      name: 'guildrop', 
      description: '傳送 guildrop 訊息給指定伺服器', 
      extraDescription: '不填參數時可以查看有開啟 guildrop 的伺服器清單', 
      aliases: ['hzdrop'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '伺服器',
        description: '有開啟 Guild Drop 的伺服器 ID',
        required: false
      }], 
      cooldown: 30
    });
  }

  public async execute(source: Source, [guildId]: [string]): Promise<void> {
    if (guildId === source.guild.id) {
      await source.defer({ ephemeral: true });
      await source.update('為什麼要轉傳訊息到自己伺服器呢？直截了當地說出來吧');
      return;
    }
    if (!source.guild.channels.cache.some(channel => channel.type === ChannelType.GuildText && channel.name === 'hz-guildrop')) {
      await source.defer({ ephemeral: true });
      await source.update('你的伺服器必須也開啟 Guild Drop 功能才能使用！\n開啟方法：建立一個名稱為 #hz-guildrop 的頻道');
      return;
    }

    const guildInfoArray = await source.client.shard?.broadcastEval((client, { ChannelType }) => {
      return client.channels.cache
        .filter((channel): channel is TextChannel => channel.type === ChannelType.GuildText && channel.name === 'hz-guildrop')
        .map(channel => ({
          name: channel.guild.name,
          id: channel.guild.id
        }));
    }, { context: { ChannelType } }).then(results => results.reduce((acc, channels) => acc.concat(channels), [])) as GuildInfo[];

    let guildInfo = guildInfoArray.find(g => g.id === guildId);
    if (guildId && !guildInfo) {
      await source.defer({ ephemeral: true });
      await source.update('找不到你輸入的伺服器，原因可能是：\n　● 你的輸入有誤\n　● 對方沒有開啟 Guild Drop');
      return;
    }

    await source.defer();

    // 沒給任何參數就顯示清單
    if (!guildId) {
      const pages = this.getGuildList(source, guildInfoArray);
      const embed = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo Guild Drop');

      guildInfo = (await pageSystem({
        mode: PageSystemMode.Description, 
        source: source, 
        embed: embed, 
        description: '請選擇一個伺服器以對該伺服器傳送 Guild Drop',
        pages: pages, 
        allowSelect: true, 
        contents: {
          exit: '清單已關閉', 
          idle: '清單已因閒置超過 30 秒而關閉'
        }
      }) ?? undefined) as GuildInfo | undefined;
    }
    if (!guildInfo) return;

    const reply = await source.update('請輸入你的訊息（限時 60 秒）：');
    const messages = await source.channel.awaitMessages({
      filter: m => m.author.id === source.user.id, 
      max: 1, 
      time: 60e3
    });
    if (!messages) {
      await reply.edit('你想訊息想太久了！請想好後再試一次。');
      return;
    }
    
    const content = (messages.first() as Message).cleanContent
      .replace(/@everyone/g, '@\u200beveryone')
      .replace(/@here/g, '@\u200bhere');
    if (content.length > 512) {
      await reply.edit('你話好多喔，可不可以用字精簡一點，不然對面覺得你洗版');
      return;
    }

    const guildrop = new EmbedBuilder()
      .applyHiZolloSettings(source.member, `來自伺服器 ${source.guild.name}（ID：${source.guild.id}）的訊息\n`)
      .setDescription(content);
    const message = { embeds: [guildrop] };

    await reply.edit('正在傳送你的訊息……');
    const success = await source.client.shard?.broadcastEval(async (client, { id, message, ChannelType }) => {
      const guild = client.guilds.cache.find(g => g.id === id);
      if (!guild) return false;

      const channel = guild.channels.cache.find((ch): ch is TextChannel => ch.type === ChannelType.GuildText && ch.name === 'hz-guildrop');
      if (!channel) return false;

      return !!(await channel.send(message).catch(() => {}));
    }, { context: { id: guildInfo.id, message, ChannelType } });

    if (success?.some(s => s)) await reply.edit('你的訊息已成功傳送');
    else await reply.edit('你的訊息傳送失敗，可能是我在對方伺服器中沒有權限');
  }

  private getGuildList(source: Source, guildInfoArray: GuildInfo[]): GuildInfo[][] {
    const pages: GuildInfo[][] = [];

    guildInfoArray.filter(g => g.id !== source.guild.id && g.id !== constant.mainGuild.id).forEach((g, i) => {
      // 每頁的第一項永遠顯示 HiZollo 官方伺服器
      if (i % 7 === 0) {
        pages.push([{
          name: `${constant.mainGuild.name}\n\`ID \` ${constant.mainGuild.id}`,
          id: constant.mainGuild.id
        }]);
      }

      pages[~~(i / 7)].push({
        name: `${removeMd(g.name)}\n\`ID \` ${g.id}`,
        id: g.id
      });
    });

    return pages;
  }
}