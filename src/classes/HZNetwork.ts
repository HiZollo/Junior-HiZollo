import { Channel, ChannelType, EmbedBuilder, Guild, GuildMFALevel, Message, PermissionFlagsBits, TextChannel, Webhook, WebhookMessageOptions } from "discord.js";
import { EventEmitter } from "events";
import { HZClient } from "./HZClient";
import config from "../config";
import tempMessage from "../features/utils/tempMessage";
import removeMd from "../features/utils/removeMd";

export class HZNetwork extends EventEmitter {
  public client: HZClient;
  public registeredPorts: Set<string>;
  public ports: Map<string, Map<string, Webhook>>;

  private hookPrefix: string;
  private portPrefix: string;
  private loaded: boolean;

  constructor(client: HZClient) {
    super();

    this.client = client;
    this.registeredPorts = new Set(['1', '8', '9', '27']);
    this.hookPrefix = config.bot.network.namePrefix;
    this.portPrefix = config.bot.network.portPrefix;
    this.ports = new Map();
    this.loaded = false;
  }

  public async load(): Promise<void> {
    if (this.client.devMode) return;
    if (this.loaded) throw new Error('HiZollo Network has already been loaded');

    for (const portNo of this.registeredPorts) {
      this.ports.set(portNo, new Map());
    }
  
    const promises = this.client.channels.cache
      .filter((channel): channel is TextChannel => {
        if (channel.type !== ChannelType.GuildText) return false;
        if (!channel.name.startsWith(this.portPrefix)) return false;
        return this.registeredPorts.has(channel.name.slice(config.bot.network.portPrefix.length));
      })
      .map(async channel => {
        if (!(channel.guild.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks) && channel.guild.mfaLevel === GuildMFALevel.None)) return;

        const portNo = this.getPortNo(channel);
        if (!portNo) return;
        await this.registerChannel(portNo, channel);
      });
    await Promise.all(promises);
    
    this.loaded = true;
    this.emit('loaded');
  }

  public async onMessageCreate(message: Message): Promise<void> {
    if (message.author.blocked) return;
    if (message.author.bot || message.webhookId) return;

    const portNo = this.getPortNo(message.channel);
    if (!portNo || message.channel.type !== ChannelType.GuildText) return;
    if (!this.ports.get(portNo)?.has(message.channel.id)) return;

    const helper = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo Network 中心', iconURL: this.client.user?.displayAvatarURL() })
      .setHiZolloColor();

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
      await message.delete().catch(() => {});

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

      await this.broadcast(portNo, {
        avatarURL: message.author.displayAvatarURL(),
        content: finalMessage.length ? finalMessage : null,
        files: attachments,
        username: message.author.tag,
      });
    } catch (error) {
      console.log(error);
      message.channel.send(`HiZollo Network 出現傳輸問題……`);
    }
  }

  public async onChannelCreate(channel: Channel): Promise<void> {
    const portNo = this.getPortNo(channel);
    if (!portNo || channel.type !== ChannelType.GuildText) return;

    await this.registerChannel(portNo, channel);
    await this.broadcast(portNo, {
      avatarURL: this.client.user?.displayAvatarURL(),
      content: `歡迎 ${channel.guild.name} 加入 HiZollo 聯絡網！`,
      username: '[ HiZollo 全頻廣播 ]',
    });
  }

  public async onChannelUpdate(oldChannel: Channel, newChannel: Channel): Promise<void> {
    const [oldPortNo, newPortNo] = [this.getPortNo(oldChannel), this.getPortNo(newChannel)];
    if (oldPortNo == newPortNo) return;

    // 新頻道是 HiZollo Network 時，將其加入聯絡網中
    if (newPortNo && newChannel.type === ChannelType.GuildText) {
      await this.registerChannel(newPortNo, newChannel);
      await this.broadcast(newPortNo, {
        avatarURL: this.client.user?.displayAvatarURL(),
        content: `歡迎 ${newChannel.guild.name} 加入 HiZollo 聯絡網！`,
        username: '[ HiZollo 全頻廣播 ]',
      });
    }

    // 舊頻道是 HiZollo Network 時，將其移出聯絡網中
    if (oldPortNo && oldChannel.type === ChannelType.GuildText) {
      this.unregisterChannel(oldPortNo, oldChannel);
    }
  }

  public async onChannelDelete(channel: Channel): Promise<void> {
    const portNo = this.getPortNo(channel);
    if (!portNo || channel.type !== ChannelType.GuildText) return;

    this.unregisterChannel(portNo, channel);
  }

  public async onGuildCreate(guild: Guild): Promise<void> {
    await guild.fetch().catch(() => {});
    guild.channels.cache.each(async channel => {
      const portNo = this.getPortNo(channel);
      if (channel.type === ChannelType.GuildText && portNo) {
        await this.registerChannel(portNo, channel);
        await this.broadcast(portNo, {
          avatarURL: this.client.user?.displayAvatarURL(),
          content: `歡迎 ${channel.guild.name} 加入 HiZollo 聯絡網！`,
          username: '[ HiZollo 全頻廣播 ]',
        });
      }
    });
  }

  public async onGuildDelete(guild: Guild): Promise<void> {
    await guild.fetch().catch(() => {});
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
   */
  public async broadcast(portNo: string, options: WebhookMessageOptions): Promise<void> {
    await this.client.shard?.broadcastEval(async (client, {portNo, options}) => {
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
    this.emit('broadcast', portNo, options);
  }

  /**
   * 把頻道註冊到選定的埠號，如果該頻道本來就有 webhook 會直接沿用，沒有 webhook 則會建立一個
   * @param portNo 埠號
   * @param channel 非討論串的文字頻道
   * @returns 原有或新建立的 webhook，可能因為機器人權限不足而無法註冊
   */
  private async registerChannel(portNo: string, channel: TextChannel): Promise<Webhook | void> {
    const webhooks = await channel.fetchWebhooks().catch(() => {});
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

      this.emit('joined', portNo, channel);
    }
    else {
      const port = this.ports.get(portNo) as Map<string, Webhook>;
      hook = hznHooks.first() as Webhook;
      if (!port.has(channel.id)) port.set(channel.id, hook);
    }

    return hook;
  }

  private unregisterChannel(portNo: string, channel: TextChannel): void {
    const success = this.ports.get(portNo)?.delete(channel.id) ?? false;
    if (success) this.emit('left', portNo, channel);
  }

  private getPortNo(channel: Channel): string | void {
    if (channel.type !== ChannelType.GuildText) return;
    if (channel.isThread()) return;
    if (!channel.name.startsWith(this.portPrefix)) return;
    if (!this.registeredPorts.has(channel.name.slice(this.portPrefix.length))) return;
    return channel.name.slice(this.portPrefix.length);
  }

  private webhookFormat(portNo: string) {
    return `${this.hookPrefix}_NETWORK_PORT_${portNo}`;
  }

  private parseReply(reply: string): string {
    reply = reply.replace(/\n/g, ' ');
    const emojis = reply.match(/<(a)?:(\w{1,32}):(\d{17,19})>?/g) || [];
    const emojiLength = emojis.join('').length - emojis.length;
    return reply.length > 30 + emojiLength ? reply.substr(0, 30 + emojiLength) + '...' : reply;
  }
}