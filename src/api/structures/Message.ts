import { APIActionRowComponent, APIApplication, APIAttachment, APIChannel, APIEmbed, APIGuildMember, APIMessage, APIMessageActionRowComponent, APIMessageActivity, APIMessageInteraction, APIMessageReference, APIStickerItem, APIUser, Channel, GatewayMessageCreateDispatchData, If, MessageFlags, MessageType, Routes, Snowflake } from "../types/types";
import { Client, Permissions, User } from ".";
import { ChannelUtil } from "../utils/ChannelUtil";
import { TextBasedChannelSendOptions } from "../types/interfaces";
import { MessageUtil } from "../utils";

export class Message<InGuild extends boolean = boolean> {
  public client!: Client;
  public id: Snowflake;
  public channelId: Snowflake;
  public user: APIUser;
  public timestamp: string;

  public content: string;
  public tts: boolean;
  public attachments: APIAttachment[];
  public embeds: APIEmbed[];
  public components?: APIActionRowComponent<APIMessageActionRowComponent>[];
  public stickerItems?: APIStickerItem[];

  public mentions: User[];
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
  public thread?: Channel;

  public guildId: If<InGuild, string>;
  public member: If<InGuild, APIGuildMember>;

  constructor(client: Client, data: GatewayMessageCreateDispatchData) {
    Object.defineProperty(this, 'client', { value: client });

    this.id = data.id;
    this.channelId = data.channel_id;
    this.user = data.author;
    this.timestamp = data.timestamp;

    this.content = data.content;
    this.tts = data.tts;
    this.attachments = data.attachments;
    this.embeds = data.embeds;
    this.components = data.components;
    this.stickerItems = data.sticker_items;

    this.mentions = data.mentions.map(m => new User(this.client, m));
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
    this.thread = data.thread ? ChannelUtil.createChannel(this.client, data.thread) : undefined;

    this.guildId = (data.guild_id ?? null) as If<InGuild, string>;
    this.member = (data.member ?? null) as If<InGuild, APIGuildMember>;
  }

  public get memberPermissions(): Permissions | null {
    if (!this.inGuild()) return null;

    const guild = this.client.guilds.get(this.guildId);
    if (!guild) return null;

    if (this.user.id === guild.ownerId) return new Permissions(Permissions.All);

    const member = this.member;

    const roles = guild.roles.filter(r => member.roles.includes(r.id));
    return new Permissions(roles.reduce((acc, cur) => acc | BigInt(cur.permissions), 0n));
  }

  public inGuild(): this is Message<true> {
    return Boolean(this.guildId && this.member);
  }

  public async send(message: TextBasedChannelSendOptions | string): Promise<Message> {
    const body = typeof message === 'string' ? { content: message } : MessageUtil.resolveBody(message);
    const files = typeof message === 'string' ? [] : await MessageUtil.resolveFiles(message.files ?? []);

    const data = await this.client.rest.post(Routes.channelMessages(this.channelId), { body, files }) as APIMessage;
    return new Message(this.client, data);
  }

  // public async delete() {}
  // public async edit() {}
  // public async fetch() {}
  // public async react() {}
  // public async reply() {}
  // public async awaitMessageComponent() {}
  // public async createMessageComponentCollector() {}
  // public async startThread() {}

  public async fetchChannel(): Promise<Channel> {
    const data = await this.client.rest.get(Routes.channel(this.channelId)) as APIChannel;
    return ChannelUtil.createChannel(this.client, data)!;
  }

  public toString(): string {
    return this.content;
  }
}