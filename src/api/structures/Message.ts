import { APIActionRowComponent, APIApplication, APIAttachment, APIChannel, APIEmbed, APIMessage, APIMessageActionRowComponent, APIMessageActivity, APIMessageInteraction, APIMessageReference, APIStickerItem, APIUser, Channel, CollectorComponentTypes, GatewayMessageCreateDispatchData, If, InteractionType, MessageFlags, MessageType, Routes, Snowflake } from "../types/types";
import { Client, GuildMember, InteractionCollector, User } from ".";
import { BaseMessageOptions, CollectorInteractionTypeMap, InteractionCollectorOptions, TextBasedChannelSendOptions } from "../types/interfaces";
import { MessageUtil } from "../utils";

export class Message<InGuild extends boolean = boolean> {
  public client!: Client;
  public id: Snowflake;
  public channelId: Snowflake;
  public user: User;
  public timestamp: string;

  public content: string;
  public tts: boolean;
  public attachments: APIAttachment[];
  public embeds: APIEmbed[];
  public components?: APIActionRowComponent<APIMessageActionRowComponent>[];
  public stickerItems?: APIStickerItem[];

  public mentions: APIUser[];
  public mentionEveryone: boolean;

  public nonce?: number | string;
  public pinned: boolean;
  public webhookId?: Snowflake;
  public type: MessageType;
  public activity?: APIMessageActivity;
  public application?: Partial<APIApplication>;
  public applicationId?: Snowflake;
  public messageReference?: APIMessageReference;
  public flags?: MessageFlags;
  public referencedMessage?: Message | null;
  public interaction?: APIMessageInteraction;
  public thread?: APIChannel;

  public guildId: If<InGuild, string>;
  public member: If<InGuild, GuildMember>;

  constructor(client: Client, data: GatewayMessageCreateDispatchData) {
    Object.defineProperty(this, 'client', { value: client });

    this.id = data.id;
    this.channelId = data.channel_id;
    this.user = new User(this.client, data.author);
    this.timestamp = data.timestamp;

    this.content = data.content;
    this.tts = data.tts;
    this.attachments = data.attachments;
    this.embeds = data.embeds;
    this.components = data.components;
    this.stickerItems = data.sticker_items;

    this.mentions = data.mentions;
    this.mentionEveryone = data.mention_everyone;

    this.nonce = data.nonce;
    this.pinned = data.pinned;
    this.webhookId = data.webhook_id;
    this.type = data.type;
    this.activity = data.activity;
    this.application = data.application;
    this.applicationId = data.application_id;
    this.messageReference = data.message_reference;
    this.flags = data.flags;
    this.referencedMessage = data.referenced_message ? new Message(this.client, data.referenced_message) : null;
    this.interaction = data.interaction;
    this.thread = data.thread ?? undefined;

    this.guildId = (data.guild_id ?? null) as If<InGuild, string>;
    this.member = (data.member && data.guild_id ? 
      new GuildMember(client, { ...data.member, user: data.author, guildId: data.guild_id }) :
      null) as If<InGuild, GuildMember>;
  }

  /**
   * 從快取中取得這則訊息所在的頻道。
   */
  public get channel(): Channel | null {
    return this.client.channels.get(this.channelId) ?? null;
  }

  public inGuild(): this is Message<true> {
    return Boolean(this.guildId && this.member);
  }

  /**
   * 取得頻道的即時資訊，並把頻道加入快取。
   * @param force 是否強制敲 API，預設為否，此時會回傳快取內的資料
   * @returns 訊息所在的頻道
   */
  public async fetchChannel(force: boolean = false): Promise<Channel> {
    if (!force && this.channel) return this.channel;
    
    const data = await this.client.rest.get(Routes.channel(this.channelId)) as APIChannel;
    this.client.channels.add(data);
    return this.client.channels.get(this.channelId)!;
  }

  public async send(message: TextBasedChannelSendOptions | string): Promise<Message> {
    const body = typeof message === 'string' ? { content: message } : MessageUtil.resolveBody(message);
    const files = typeof message === 'string' ? [] : await MessageUtil.resolveFiles(message.files ?? []);

    const data = await this.client.rest.post(Routes.channelMessages(this.channelId), { body, files }) as APIMessage;
    return new Message(this.client, data);
  }

  public async reply(message: TextBasedChannelSendOptions | string): Promise<Message> {
    const body = typeof message === 'string' ? { content: message } : MessageUtil.resolveBody(message);
    const files = typeof message === 'string' ? [] : await MessageUtil.resolveFiles(message.files ?? []);

    const data = await this.client.rest.post(Routes.channelMessages(this.channelId), {
      body: {
        ...body, 
        message_reference: {
          message_id: this.id
        }
      }, 
      files
    }) as APIMessage;
    return new Message(this.client, data);
  }

  public async delete(): Promise<this> {
    await this.client.rest.delete(Routes.channelMessage(this.channelId, this.id));
    return this;
  }

  /**
   * 編輯這則訊息，但不會更新訊息，因為我懶得寫
   * @param message 編輯內容
   * @returns 自己
   */
  public async edit(message: BaseMessageOptions | string): Promise<this> {
    const body = typeof message === 'string' ? { content: message } : MessageUtil.resolveBody(message);
    const files = typeof message === 'string' ? [] : await MessageUtil.resolveFiles(message.files ?? []);

    await this.client.rest.patch(Routes.channelMessage(this.channelId, this.id), { body, files }) as APIMessage;
    return this;
  }

  public async react(emoji: string): Promise<void> {
    if (/\d{17,20}/.test(emoji)) {
      emoji = `emoji:${emoji}`;
    }

    await this.client.rest.put(Routes.channelMessageOwnReaction(this.channelId, this.id, emoji));
  }
  
  public createComponentCollector<T extends CollectorComponentTypes>(options: Omit<InteractionCollectorOptions, "interactionType" | "messageId" | "channelId" | "guildId"> & { componentType: CollectorComponentTypes; }): InteractionCollector<CollectorInteractionTypeMap[T]> {
    return new InteractionCollector({ messageId: this.id, channelId: this.channelId, guildId: this.guildId ?? undefined, interactionType: InteractionType.MessageComponent , ...options });
  }

  public awaitComponents<T extends CollectorComponentTypes>(options: Omit<InteractionCollectorOptions, "interactionType" | "messageId" | "channelId" | "guildId"> & { componentType: CollectorComponentTypes; }): Promise<Map<string, CollectorInteractionTypeMap[T]>> {
    return new Promise(resolve => {
      this.createComponentCollector(options).on('end', resolve);
    });
  }

  public toString(): string {
    return this.content;
  }
}