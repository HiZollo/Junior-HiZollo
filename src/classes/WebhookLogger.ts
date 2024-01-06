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

import { EmbedBuilder, Guild, Message, TextChannel, User, WebhookClient } from "discord.js";
import config from "@root/config";
import constant from "@root/constant.json";
import { HZClient } from "./HZClient";
import { Source } from "./Source";

/**
 * 掌管所有記錄器
 */
export class WebhookLogger {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 主要的記錄器
   */
  public mainLogger: WebhookClient;

  /**
   * 記錄 Network 狀態的記錄器
   */
  public networkLogger: WebhookClient;

  /**
   * 記錄錯誤內容的記錄器
   */
  public errorLogger: WebhookClient;

  /**
   * 建立一個記錄器管家
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    this.client = client;

    this.mainLogger = new WebhookClient({ id: config.webhooks.main.id, token: config.webhooks.main.token });
    this.networkLogger = new WebhookClient({ id: config.webhooks.network.id, token: config.webhooks.network.token });
    this.errorLogger = new WebhookClient({ id: config.webhooks.error.id, token: config.webhooks.error.token });
  }

  /**
   * client 已就緒
   */
  public ready(): void {
    const description =
      `成功登入 ${this.client.user?.tag}
版本：${constant.bot.version}
本分支目前服務 ${this.client.guilds.cache.size} 個伺服器`;

    this.send('Log', description, this.client.devMode ? 0xD70000 : 0xFF7D7D);
  }

  /**
   * 加入伺服器
   * @param guild 伺服器
   */
  public async joinGuild(guild: Guild): Promise<void> {
    const description =
      `加入伺服器：${guild.name}
ID：${guild.id}
目前服務 ${await this.client.guildCount()} 個伺服器`;

    this.send('Log', description, 0x7DFF7D);
  }

  /**
   * 離開伺服器
   * @param guild 伺服器
   */
  public async leaveGuild(guild: Guild): Promise<void> {
    const description =
      `離開伺服器：${guild.name}
ID：${guild.id}
目前服務 ${await this.client.guildCount()} 個伺服器`;

    this.send('Log', description, 0x00D700);
  }

  /**
   * 發生錯誤
   * @param error 錯誤
   */
  public error(error: Error): void {
    const elines = error.stack?.split('\n');
    const ename = elines?.shift() ?? 'No Error Name Specified.';
    const estacks = elines?.map(eline => `\`${eline.trim()}\``) ?? [];

    const log = new EmbedBuilder()
      .setAuthor({ name: `Error - ${Date.now()}`, iconURL: this.client.user?.displayAvatarURL() })
      .setColor(0x000000)
      .setDescription(`**${ename}**`);
    this.mainLogger.send({ embeds: [log] });

    log.setDescription(`**${ename}**\n${estacks.join('\n')}`)
      .setFooter({ text: `分支編號：${this.client.shard?.ids[0]}` });
    this.errorLogger.send({ embeds: [log] });

    console.log(error);
  }

  /**
   * 指令執行成功
   * @param source 來源
   * @param commandName 指令名稱
   * @param args 指令參數
   */
  public commandExecuted(source: Source, commandName: [string, string | undefined], ...args: unknown[]): void {
    const description =
      `${source.isChatInput() ? `斜線指令：\`/` : `訊息指令：\`${config.bot.prefix}`}${commandName[0]}${commandName[1] ? ` ${commandName[1]}` : ``}\`
執行者：${source.user}
參數：${args.join(' ')}
伺服器：${source.guild.id}`;

    this.send('Log', description, source.isChatInput() ? 0x7DFFFF : 0x7D7DFF);
  }

  /**
   * 隱藏指令執行成功
   * @param message 來源訊息
   * @param commandName 指令名稱
   */
  public hiddenExecuted(message: Message, commandName: string): void {
    const description =
      `隱藏指令：${commandName}
執行者：${message.author}
伺服器：${message.guild!.id}`;

    this.send('Log', description, 0xFF7DFF);
  }

  /**
   * Network 發送訊息
   * @param portNo 埠號
   * @param guild 來源伺服器
   * @param author 發送者
   */
  public networkCrossPost(portNo: string, guild: Guild, author: User): void {
    const description =
      `在 ${portNo} 號埠上發送訊息
伺服器：${guild.id}
使用者：${author.tag}（${author.id}）`;

    this.send('Network Log', description, 0x7D7DFF);
  }

  /**
 * Network 發送訊息
 * @param portNo 埠號
 * @param guild 來源伺服器
 * @param author 發送者
 */
  public networkUnallowPost(portNo: string, guild: Guild, author: User, message: Message): void {
    const description =
      `在 ${portNo} 號埠上發送訊息
  伺服器：${guild.id}
  使用者：${author.tag}（${author.id}）
  訊息內容：${message.content}
  `;

    this.send('Network Log', description, 0xFF5733);
  }

  /**
   * Network 全頻廣播
   * @param portNo 埠號
   * @param content 廣播內容
   */
  public networkBroadcast(portNo: string, content: string): void {
    const description =
      `在 ${portNo} 號埠上全頻廣播
廣播內容：${content}`;

    this.send('Network Log', description, 0xFFFF7D);
  }

  /**
   * 加入 Network
   * @param portNo 埠號
   * @param channel 頻道
   */
  public networkJoined(portNo: string, channel: TextChannel): void {
    const description =
      `在 ${portNo} 號埠上建立連線
伺服器：${channel.guild.id}
頻道：${channel.id}`;

    this.send('Network Log', description, 0x7DFF7D);
  }

  /**
   * 離開 Network
   * @param portNo 埠號
   * @param channel 頻道
   */
  public networkLeft(portNo: string, channel: TextChannel): void {
    const description =
      `在 ${portNo} 號埠上刪除連線
伺服器：${channel.guild.id}
頻道：${channel.id}`;

    this.send('Network Log', description, 0xFF7D7D);
  }

  /**
   * 取得基本的嵌入物件
   * @param title 嵌入物件的標題
   * @returns 嵌入物件
   */
  private baseEmbed(title: string): EmbedBuilder {
    return new EmbedBuilder()
      .setAuthor({ name: `${title} - ${Date.now()}`, iconURL: this.client.user?.displayAvatarURL() })
      .setFooter({ text: `分支編號：${this.client.shard?.ids[0]}` });
  }

  /**
   * 記錄訊息
   * @param target 訊息種類
   * @param description 訊息內容
   * @param color 嵌入物件的顏色
   */
  private send(target: 'Log' | 'Network Log' | 'Error Log', description: string, color: number): void {
    const logger =
      target === 'Log' ? this.mainLogger :
        target === 'Network Log' ? this.networkLogger :
          this.errorLogger;
    logger.send({ embeds: [this.baseEmbed(target).setColor(color).setDescription(description)] });
    if (target === 'Log') console.log(description);
  }
}