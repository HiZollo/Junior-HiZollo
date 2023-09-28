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

import { APIEmbedField, APIEmbedProvider, ApplicationCommandOptionType, EmbedAssetData, EmbedAuthorData, EmbedFooterData, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import fixedDigits from "../features/utils/fixedDigits";
import { CommandType } from "../typings/enums";

type GetmsgAttatchmentResult = {
  id: string, 
  name: string | null, 
  url: string, 
  size: number
};

type GetmsgEmbedResult = {
  color: number | null,
  contents: {
    thumbnail?: string,
    title: string | null,
    description: string | null,
    fields: APIEmbedField[],
    footer: EmbedFooterData | null
  },
  url: string | null,
  image: EmbedAssetData | null,
  video: EmbedAssetData | null,
  author: EmbedAuthorData | null,
  provider: APIEmbedProvider | null
}

type GetmsgJSONMessagesResult = {
  authorName: string,
  authorId: string,
  authorDiscriminator: string,
  authotTag: string,
  date: {
    timestamp: number,
    formatted: string
  },
  messageId: string,
  content: string,
  bot: boolean,
  replyTo?: string,
  attachments: GetmsgAttatchmentResult[],
  embeds: GetmsgEmbedResult[]
};

type GetmsgJSONResult = {
  guild?: string, 
  guildId?: string, 
  channel?: string, 
  channelId?: string, 
  messages: GetmsgJSONMessagesResult[]
};

export default class Getmsg extends Command<[string, number]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'getmsg', 
      description: '將頻道最近 100 條訊息匯出成指定格式的檔案', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '格式',
        description: '要匯出的檔案格式',
        required: true,
        choices: [
          { name: 'txt', value: 'txt' },
          { name: 'json', value: 'json' }
        ]
      },{
        type: ApplicationCommandOptionType.Integer, 
        name: '數量', 
        description: '要獲取的訊息數量',
        minValue: 1, 
        maxValue: 100
      }], 
      permissions: {
        bot: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
        user: [PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      },
    });
  }

  public async execute(source: Source, [format, count = 100]: [string, number]): Promise<void> {
    await source.defer();

    let log!: Buffer;

    const message = await source.update('搜取訊息中……');
    const messages = await source.channel?.messages.fetch({ limit: count, before: source.id }).catch(() => {});
    if (!messages) {
      await message.edit('搜取訊息失敗，請再試一次');
      return;
    }

    await message.edit('檔案製作中……');
    if (format === 'txt') {
      let entries = '';

      messages.each(msg => {
        let entry = '';
        entry += `${getDate(msg.createdAt)}\n${msg.author.tag}${msg.author.bot ? ' [機器人]' : ''}：${msg.cleanContent}\n`;
        const attachments = msg.attachments;
        if (attachments.size) {
          entry += '[訊息附件]\n';
          attachments.each(att => {
            entry += `${att.url}\n`;
          });
        }
        entries = `${entry}\n${entries}`;
      });

      log = Buffer.from(entries, "utf-8");
    }

    if (format === 'json') {
      const result: GetmsgJSONResult = {
        guild: source.guild?.name,
        guildId: source.guild?.id,

        channel: (source.channel && 'name' in source.channel) ? source.channel.name : undefined,
        channelId: source.channel?.id,

        messages: []
      };

      messages.each(msg => {
        const attachments: GetmsgAttatchmentResult[] = [];
        msg.attachments.each(att => {
          attachments.unshift({
            id: att.id,
            name: att.name,
            url: att.url,
            size: att.size
          });
        });

        const embeds: GetmsgEmbedResult[] = [];
        msg.embeds.forEach(embed => {
          embeds.unshift({
            color: embed.color,
            contents: {
              thumbnail: embed.thumbnail?.url,
              title: embed.title,
              description: embed.description,
              fields: embed.fields,
              footer: embed.footer
            },
            url: embed.url,
            image: embed.image,
            video: embed.video,
            author: embed.author,
            provider: embed.provider
          });
        });

        result.messages.unshift({
          authorName: msg.author.username,
          authorId: msg.author.id,
          authorDiscriminator: msg.author.discriminator,
          authotTag: msg.author.tag,

          date: {
            timestamp: msg.createdTimestamp,
            formatted: getDate(msg.createdAt)
          },

          messageId: msg.id,
          content: msg.content,
          bot: msg.author.bot,
          replyTo: msg.reference?.messageId,

          attachments: attachments,
          embeds: embeds
        });
      });

      log = Buffer.from(JSON.stringify(result), "utf-8");
    }

    await message.edit('檔案傳送中……');
    await source.channel?.send({
      files: [{
        attachment: log,
        name: `log.${format}`
      }]
    });

    await message.edit('資料彙整完畢');
  }
}

function getDate(date: Date): string {
  const year = date.getFullYear();
  const month = fixedDigits(date.getMonth()+1, 2);
  const day = fixedDigits(date.getDate(), 2);
  const hour = date.getHours();
  const min = fixedDigits(date.getMinutes(), 2);
  const sec = fixedDigits(date.getSeconds(), 2);

  return `${year}/${month}/${day} ${hour}:${min}:${sec}`;
}
