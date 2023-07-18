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

import { ChatInputCommandInteraction, Client, Guild, GuildMember, GuildTextBasedChannel, InteractionDeferReplyOptions, InteractionResponse, Message, MessageCreateOptions, MessagePayload, User, WebhookMessageEditOptions } from "discord.js";
import tempMessage from "../features/utils/tempMessage";

/**
 * 把斜線指令與訊息融合的類別
 */
export class Source<T extends ChatInputCommandInteraction<"cached"> | Message<true> = ChatInputCommandInteraction<"cached"> | Message<true>> {
  /**
   * 來源
   */
  public source: T;

  /**
   * 來源頻道
   */
  public channel: GuildTextBasedChannel;

  /**
   * 來源頻道的 ID
   */
  public channelId: string;

  /**
   * 機器人的 client
   */
  public client: Client;

  /**
   * 來源的建立時間
   */
  public createdAt: Date;

  /**
   * 來源的建立時間戳
   */
  public createdTimestamp: number;

  /**
   * 來源的伺服器
   */
  public guild: Guild;

  /**
   * 來源的 ID
   */
  public id: string;

  /**
   * 來源的觸發成員
   */
  public member: GuildMember;

  /**
   * 來源的觸發使用者
   */
  public user: User;

  /**
   * 建立一個來源
   * @param source 來源
   * @param channel 來源頻道
   * @param member 來源的觸發成員
   */
  constructor(source: T, channel: GuildTextBasedChannel, member: GuildMember) {
    this.source = source;

    this.channel = channel;
    this.channelId = source.channelId;
    this.client = source.client;
    this.createdAt = source.createdAt;
    this.createdTimestamp = source.createdTimestamp;
    this.guild = source.guild;
    this.id = source.id;
    this.member = member;
    this.user = 'user' in source ? source.user : source.author;
  }

  /**
   * **[Type Guard]** 來源是斜線指令
   */
  public isChatInput(): this is Source<ChatInputCommandInteraction<"cached">> {
    return this.source instanceof ChatInputCommandInteraction
  }

  /**
   * **[Type Guard]** 來源是訊息
   */
  public isMessage(): this is Source<Message<true>> {
    return this.source instanceof Message;
  }


  /**
   * 來源是否已被延遲，若來源是訊息則永遠回傳 false
   */
  public get deferred(): boolean {
    return this.source instanceof ChatInputCommandInteraction && this.source.deferred;
  }

  /**
   * 隱藏來源
   * 
   * 斜線指令：呼叫 `.deferReply({ ephemeral: true, ...options })`
   * 
   * 訊息：呼叫 `.delete()`
   * 
   * @param options 上述函式的選項
   * @returns 上述函式的回傳值
   */
  public async hide(options?: InteractionDeferReplyOptions & { fetchReply: true }): Promise<Message | InteractionResponse | void> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.deferReply({ ephemeral: true, ...options});
    }
    if (this.source.deletable) {
      return this.source.delete().catch(() => {});
    }
  }

  /**
   * 延遲來源
   * 
   * 斜線指令：呼叫 `.deferReply()`
   * 
   * 訊息：不做任何事
   * 
   * @param options 上述函式的選項
   * @returns 上述函式的回傳值
   */
  public async defer(options?: InteractionDeferReplyOptions & { fetchReply?: true }): Promise<Message | InteractionResponse | void> {
    if (this.source instanceof ChatInputCommandInteraction && !this.source.deferred) {
      return this.source.deferReply(options);
    }
  }

  /**
   * 傳送暫時的訊息，通常使用此函式前斜線指令會先被 ephemerally deferred
   * 
   * 斜線指令：呼叫 `.editReply()`
   * 
   * 訊息：調用 `tempMessage()`
   * 
   * @param options 上述函式的選項
   * @returns 上述函式的回傳值
   */
  public async temp(options: string | MessageCreateOptions): Promise<Message> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
    return tempMessage(this.source.channel, options, 5);
  }

  /**
   * 需要單獨對斜線指令編輯時可以使用此函式
   * 
   * 斜線指令：呼叫 `.editReply()`
   * 
   * 訊息：不做任何事
   * 
   * @param options 上述函式的選項
   * @returns 上述函式的回傳值
   */
  public async editReply(options: string | MessagePayload | WebhookMessageEditOptions): Promise<Message | void> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
  }

  /**
   * 實際回應指令，通常會緊接在 {@link defer} 以後
   * 
   * 斜線指令：呼叫 `.editReply()`
   * 
   * 訊息：呼叫 `.channel.send()`
   * 
   * @param options 上述函式的選項
   * @returns 上述函式的回傳值
   */
  public async update(options: string | MessageCreateOptions): Promise<Message> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
    return this.source.channel.send(options)
  }

  /**
   * 把來源轉換為 JSON 格式
   * @param props 轉換的參數
   * @returns JSON 化後的資料
   */
  public toJSON(...props: Record<string, string | boolean>[]): unknown {
    return this.source.toJSON(...props);
  }
}
