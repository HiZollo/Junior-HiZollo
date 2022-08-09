import { ChatInputCommandInteraction, Client, Guild, GuildMember, GuildTextBasedChannel, InteractionDeferReplyOptions, InteractionResponse, Message, MessagePayload, User, WebhookEditMessageOptions } from "discord.js";
import tempMessage from "../features/utils/tempMessage";

export class Source<T extends ChatInputCommandInteraction<"cached"> | Message<true> = ChatInputCommandInteraction<"cached"> | Message<true>> {
  public source: T;
  public channel: GuildTextBasedChannel;
  public channelId: string;
  public client: Client;
  public createdAt: Date;
  public createdTimestamp: number;
  public guild: Guild;
  public id: string;
  public member: GuildMember;
  public user: User;

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


  public isChatInput(): this is Source<ChatInputCommandInteraction<"cached">> {
    return this.source instanceof ChatInputCommandInteraction<"cached">;
  }

  public isMessage(): this is Source<Message<true>> {
    return this.source instanceof Message<true>;
  }

  public get deferred(): boolean {
    return this.source instanceof ChatInputCommandInteraction && this.source.deferred;
  }

  /**
   * CommandInteraction：呼叫 `.deferReply()`。
   * Message：呼叫 `.delete()`。
   * @param options deferReply 的選項
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
   * CommandInteraction：呼叫 `.deferReply()`。
   * Message：不做任何事。
   * @param options deferReply 的選項
   */
  public async defer(options?: InteractionDeferReplyOptions & { fetchReply?: true }): Promise<Message | InteractionResponse | void> {
    if (this.source instanceof ChatInputCommandInteraction && !this.source.deferred) {
      return this.source.deferReply(options);
    }
  }

  public async temp(options: string | MessagePayload | WebhookEditMessageOptions): Promise<Message> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
    return tempMessage(this.source.channel, options, 5);
  }

  /**
   * CommandInteraction：呼叫 `.editReply()`。
   * Message：不做任何事。
   * @param options 編輯選項
   * @returns 編輯／發送後的訊息
   */
  public async editReply(options: string | MessagePayload | WebhookEditMessageOptions): Promise<Message | void> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
  }

  /**
   * CommandInteraction：呼叫 `.editReply()`。
   * Message：呼叫 `.edit()`。
   * @param options 編輯選項
   * @returns 編輯／發送後的訊息
   */
  public async edit(options: string | MessagePayload | WebhookEditMessageOptions): Promise<Message | void> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
    if (this.source.editable) {
      return this.source.edit(options);
    }
  }

  /**
   * CommandInteraction：呼叫 `.editReply()`。
   * Message：呼叫 `.channel.send`。
   * @param options deferReply 的選項
   * @returns 編輯／發送後的訊息
   */
  public async update(options: string | MessagePayload | WebhookEditMessageOptions): Promise<Message> {
    if (this.source instanceof ChatInputCommandInteraction) {
      return this.source.editReply(options);
    }
    return this.source.channel.send(options);
  }

  public toJSON(...props: Record<string, string | boolean>[]): unknown {
    return this.source.toJSON(...props);
  }
}