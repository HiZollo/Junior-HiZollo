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

import { Awaitable, Channel, ChannelType, EmbedBuilder, Guild, Message, PermissionFlagsBits, TextChannel, Webhook, WebhookMessageCreateOptions } from "discord.js";
import { EventEmitter } from "node:events";
import { HZClient } from "./HZClient";
import config from "@root/config";
import tempMessage from "../features/utils/tempMessage";
import removeMd from "../features/utils/removeMd";
import { HZNetworkEvents } from "../typings/interfaces";

/**
 * HiZollo Network 系統
 * @extends EventEmitter
 */
export class HZNetwork extends EventEmitter {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 所有已開放的埠號
   */
  public publicPortNo: Set<string>;

  /**
   * 埠號－（頻道 ID－Webhook）的鍵值對
   */
  public ports: Map<string, Map<string, Webhook>>;

  /**
   * Network Webhook 名稱的前綴
   */
  private hookPrefix: string;

  /**
   * Network 頻道名稱的前綴
   */
  private portPrefix: string;

  /**
   * Network 是否已載入完畢
   */
  private loaded: boolean;

  /**
   * 建立 HiZollo Network
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    super();

    this.client = client;
    this.publicPortNo = new Set(['1', '8', '9', '27']);
    this.hookPrefix = config.bot.network.namePrefix;
    this.portPrefix = config.bot.network.portPrefix;
    this.ports = new Map();
    this.loaded = false;
  }

  /**
   * 載入 HiZollo Network
   */
  public async load(): Promise<void> {
    if (this.client.devMode) return;
    if (this.loaded) throw new Error('HiZollo Network has already been loaded');

    for (const portNo of this.publicPortNo) {
      this.ports.set(portNo, new Map());
    }

    const promises = this.client.channels.cache
      .filter((channel): channel is TextChannel => {
        if (channel.type !== ChannelType.GuildText) return false;
        if (!channel.name.startsWith(this.portPrefix)) return false;
        return this.publicPortNo.has(channel.name.slice(config.bot.network.portPrefix.length));
      })
      .map(async channel => {
        if (!channel.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks)) return;

        const portNo = this.getPortNo(channel);
        if (!portNo) return;
        await this.registerChannel(portNo, channel, true);
      });
    await Promise.all(promises);

    this.loaded = true;
    this.emit('loaded');
  }

  /**
   * 轉接第一線的訊息
   * @param message 從 client#on('messageCreate') 得到的訊息
   */
  public async onMessageCreate(message: Message): Promise<void> {
    if (message.author.blocked) return;
    if (message.author.bot || message.webhookId) return;
    if (!message.guild) return;

    const portNo = this.getPortNo(message.channel);
    if (!portNo || message.channel.type !== ChannelType.GuildText) return;
    if (!this.ports.get(portNo)?.has(message.channel.id)) return;

    const helper = new EmbedBuilder().applyHiZolloSettings(message.member, 'HiZollo Network 中心');

    const content = message.cleanContent
      .replace(/@everyone/g, `@\u200beveryone`)
      .replace(/@here/g, `@\u200bhere`)
      .replace(/\]\(/g, ']\u200b('); // 禁用 Markdown 語法

    const verifiedString = content.replace(/\n| /g, '');
    const inviteBlocker = /(https?:\/\/)?discord(app)?(.gg|.com\/invite)/gi;
    if (inviteBlocker.test(verifiedString)) {
      message.delete();
      helper.setDescription('你的訊息中含有不合法的連結，因此我無法傳送');
      tempMessage(message.channel, { embeds: [helper] }, 3);
      return;
    }

    // 附加檔案
    const attachments: ({ attachment: string, name: string })[] = [];
    let totalSize = 0;
    message.attachments.each(a => {
      attachments.push({
        attachment: a.url,
        name: a.spoiler ? `SPOILER_${a.name ?? 'attachment'}` : a.name ?? 'attachment'
      });
      totalSize += a.size;
    });

    if (totalSize > 512 * 1024) {
      message.delete();
      helper.setDescription('訊息的總檔案大小已超過 512kb，請先將檔案壓縮再傳進 HiZollo Netwrok 中');
      tempMessage(message.channel, { embeds: [helper] }, 3);
      return;
    }

    // 貼圖
    const stickers = [...message.stickers.keys()];

    // 回覆
    const reference: { content?: string, username?: string } = {};
    if (message.reference?.messageId) {
      const msg = await message.channel.messages.fetch(message.reference.messageId);
      if (msg) {
        const text = msg.cleanContent
          .replace(/@everyone/g, `@\u200beveryone`)
          .replace(/@here/g, `@\u200bhere`)
          .replace(/\]\(/g, ']\u200b(')
          .replace(/^> .+?\n/, ''); // 刪除回覆的回覆
        reference.content = this.parseReply(text);
        if (msg.attachments.size > 0) reference.content += ' <:attachment:875011591953874955>';
        reference.username = removeMd(msg.author.username);
      }
    }

    // 傳送訊息
    try {
      await message.delete().catch(() => { });

      let finalMessage = '';
      if (reference.content?.length) finalMessage += `> **${reference.username}**：${reference.content}\n`;
      if (content.length) finalMessage += content;

      if (finalMessage.length > 500) {
        helper.setDescription('你的訊息已超過 500 字元的上限，請縮減訊息，避免洗版');
        tempMessage(message.channel, { embeds: [helper] }, 3);
        return;
      }

      if (stickers.length) {
        helper.setDescription('HiZollo Network 並不支援貼圖');
        tempMessage(message.channel, { embeds: [helper] }, 3);
        return;
      }

      if (!finalMessage.length && !attachments.length) {
        helper.setDescription('你的訊息似乎是空的');
        tempMessage(message.channel, { embeds: [helper] }, 3);
        return;
      }

      const options = {
        avatarURL: message.author.displayAvatarURL(),
        content: finalMessage.length ? finalMessage : undefined,
        files: attachments,
        username: message.author.tag,
      };
      await this.crosspost(portNo, options);
      this.emit('crosspost', portNo, message.guild, message.author);
    } catch (error) {
      message.channel.send(`HiZollo Network 出現傳輸問題……`);
      this.emit('error', error as Error);
    }
  }

  /**
   * 轉接第一線的新頻道
   * @param channel 從 client#on('channelCreate') 得到的頻道
   */
  public async onChannelCreate(channel: Channel): Promise<void> {
    const portNo = this.getPortNo(channel);
    if (!portNo || channel.type !== ChannelType.GuildText) return;

    await this.registerChannel(portNo, channel);
  }

  /**
   * 轉接第一線的頻道更新事件
   * @param oldChannel 從 client#on('channelUpdate') 得到的舊頻道
   * @param newChannel 從 client#on('channelUpdate') 得到的新頻道
   */
  public async onChannelUpdate(oldChannel: Channel, newChannel: Channel): Promise<void> {
    const [oldPortNo, newPortNo] = [this.getPortNo(oldChannel), this.getPortNo(newChannel)];
    if (oldPortNo == newPortNo) return;

    // 新頻道是 HiZollo Network 時，將其加入聯絡網中
    if (newPortNo && newChannel.type === ChannelType.GuildText) {
      await this.registerChannel(newPortNo, newChannel);
    }

    // 舊頻道是 HiZollo Network 時，將其移出聯絡網中
    if (oldPortNo && oldChannel.type === ChannelType.GuildText) {
      this.unregisterChannel(oldPortNo, oldChannel);
    }
  }

  /**
   * 轉接第一線的頻道刪除事件
   * @param channel 從 client#on('channelDelete') 得到的頻道
   */
  public async onChannelDelete(channel: Channel): Promise<void> {
    const portNo = this.getPortNo(channel);
    if (!portNo || channel.type !== ChannelType.GuildText) return;

    this.unregisterChannel(portNo, channel);
  }

  /**
   * 轉接第一線的新伺服器
   * @param guild 從 client#on('guildCreate') 得到的伺服器
   */
  public async onGuildCreate(guild: Guild): Promise<void> {
    await guild.fetch().catch(() => { });
    guild.channels.cache.each(async channel => {
      const portNo = this.getPortNo(channel);
      if (channel.type === ChannelType.GuildText && portNo) {
        await this.registerChannel(portNo, channel);
      }
    });
  }

  /**
   * 轉接第一線的伺服器刪除事件
   * @param guild 從 client#on('guildDelete') 得到的伺服器
   */
  public async onGuildDelete(guild: Guild): Promise<void> {
    await guild.fetch().catch(() => { });
    guild.channels.cache.each(async channel => {
      const portNo = this.getPortNo(channel);
      if (channel.type === ChannelType.GuildText && portNo) {
        this.unregisterChannel(portNo, channel);
      }
    });
  }

  /**
   * 向相同埠號的所有頻道發送訊息
   * @param portNo 埠號
   * @param options 要發送的訊息
   * @param isBroadcast 是否為官方全頻公告
   */
  public async crosspost(portNo: string, options: WebhookMessageCreateOptions, isBroadcast?: boolean): Promise<void> {
    await this.client.shard?.broadcastEval(async (client, { portNo, options }) => {
      const webhooks = client.network.ports.get(portNo);
      if (!webhooks) return;

      const iter = webhooks.entries();
      await Promise.all(Array.from({ length: webhooks.size }, async () => {
        const [channelId, webhook] = iter.next().value;
        await webhook.send(options).catch(() => {
          client.network.unregisterChannel(portNo, channelId);
        });
      }));
    }, { context: { portNo, options } });

    if (isBroadcast) {
      this.emit('broadcast', portNo, options.content ?? '[無訊息內容]');
    }
  }

  /**
   * 把頻道註冊到選定的埠號，如果該頻道本來就有 webhook 會直接沿用，沒有 webhook 則會建立一個
   * @param portNo 指定的埠號
   * @param channel 非討論串的文字頻道
   * @param isInitialize 註冊頻道的動作是不是在初始化時執行
   * @returns 原有或新建立的 webhook，可能因為機器人權限不足而無法註冊
   */
  private async registerChannel(portNo: string, channel: TextChannel, isInitialize?: boolean): Promise<Webhook | void> {
    const webhooks = await channel.fetchWebhooks().catch(() => { });
    if (!webhooks) return;

    const hznHooks = webhooks.filter(hook => hook.name === this.webhookFormat(portNo));

    let hook: Webhook;
    if (!hznHooks.size) {
      hook = await channel.createWebhook({
        name: this.webhookFormat(portNo),
        avatar: this.client.user?.displayAvatarURL(),
        reason: '建立 HiZollo 聯絡網'
      });
      this.ports.get(portNo)?.set(channel.id, hook);
    }
    else {
      const port = this.ports.get(portNo) as Map<string, Webhook>;
      hook = hznHooks.first() as Webhook;
      if (!port.has(channel.id)) port.set(channel.id, hook);
    }

    if (!isInitialize) {
      await this.crosspost(portNo, {
        avatarURL: this.client.user?.displayAvatarURL(),
        content: `歡迎 ${channel.guild.name} 加入 HiZollo 聯絡網！`,
        username: '[ HiZollo 全頻廣播 ]',
      });
      this.emit('joined', portNo, channel);
    }

    return hook;
  }

  /**
   * 把指定埠號的指定頻道移除，這個動作並不會刪除 Webhook
   * @param portNo 指定的埠號
   * @param channel 指定的頻道
   */
  private unregisterChannel(portNo: string, channel: TextChannel): void {
    const success = this.ports.get(portNo)?.delete(channel.id) ?? false;
    if (success) this.emit('left', portNo, channel);
  }

  /**
   * 判斷頻道名稱是否符合 Network 的格式，並回傳對應埠號
   * @param channel 指定的頻道
   * @returns 格式正確時回傳埠號
   */
  private getPortNo(channel: Channel): string | void {
    if (channel.type !== ChannelType.GuildText) return;
    if (channel.isThread()) return;
    if (!channel.name.startsWith(this.portPrefix)) return;
    if (!this.publicPortNo.has(channel.name.slice(this.portPrefix.length))) return;
    return channel.name.slice(this.portPrefix.length);
  }

  /**
   * 取得指定埠號對應的 Webhook 名稱
   * @param portNo 指定的埠號
   * @returns Webhook 名稱
   */
  private webhookFormat(portNo: string): string {
    return `${this.hookPrefix}_NETWORK_PORT_${portNo}`;
  }

  /**
   * 保留字串的前 30 個字元（表情符號視為一個字元），如果字串過長就在後方補上 `...`
   * @param reply 輸入字串
   * @returns 轉換後的字串
   */
  private parseReply(reply: string): string {
    reply = reply.replace(/\n/g, ' ');
    const emojis = reply.match(/<(a)?:(\w{1,32}):(\d{17,19})>?/g) || [];
    const emojiLength = emojis.join('').length - emojis.length;
    return reply.length > 30 + emojiLength ? reply.substring(0, 30 + emojiLength) + '...' : reply;
  }


  public on<K extends keyof HZNetworkEvents>(event: K, listener: (...args: HZNetworkEvents[K]) => Awaitable<void>): this;
  public on<S extends string | symbol>(event: Exclude<S, keyof HZNetworkEvents>, listener: (...args: any[]) => Awaitable<void>): this;
  public on(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.on(event, listener);
  }

  public once<K extends keyof HZNetworkEvents>(event: K, listener: (...args: HZNetworkEvents[K]) => Awaitable<void>): this;
  public once<S extends string | symbol>(event: Exclude<S, keyof HZNetworkEvents>, listener: (...args: any[]) => Awaitable<void>): this;
  public once(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.once(event, listener);
  }

  public emit<K extends keyof HZNetworkEvents>(event: K, ...args: HZNetworkEvents[K]): boolean;
  public emit<S extends string | symbol>(event: Exclude<S, keyof HZNetworkEvents>, ...args: unknown[]): boolean;
  public emit(event: string | symbol, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  public off<K extends keyof HZNetworkEvents>(event: K, listener: (...args: HZNetworkEvents[K]) => Awaitable<void>): this;
  public off<S extends string | symbol>(event: Exclude<S, keyof HZNetworkEvents>, listener: (...args: any[]) => Awaitable<void>): this;
  public off(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.off(event, listener);
  }
}
