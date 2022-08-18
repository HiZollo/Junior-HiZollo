import { APIActionRowComponent, APIApplication, APIAttachment, APIEmbed, APIMessageActionRowComponent, APIMessageActivity, APIMessageInteraction, APIMessageReference, APIStickerItem, GatewayMessageCreateDispatchData, MessageFlags, MessageType, Snowflake } from "../types/types";
import { Channel, Client, User } from ".";

export class Message {
  public client: Client;
  public id: Snowflake;
  public channelId: Snowflake;
  public user: User;
  public content: string;
  public timestamp: string;
  public tts: boolean;
  public mentions: User[];
  public mentionEveryone: boolean;
  public attachments: APIAttachment[];
  public embeds: APIEmbed[];
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
  public components?: APIActionRowComponent<APIMessageActionRowComponent>[];
  public stickerItems?: APIStickerItem[];
  public position?: number;

  constructor(client: Client, data: GatewayMessageCreateDispatchData) {
    if (!data.guild_id || !data.member) throw new Error('Failed to build Message: Message not in guild.');

    this.client = client;
    this.id = data.id;
    this.channelId = data.channel_id
    this.user = new User(this.client, data.author);
    this.content = data.content;
    this.timestamp = data.timestamp;
    this.tts = data.tts;
    this.mentions = data.mentions.map(m => new User(this.client, m));
    this.mentionEveryone = data.mention_everyone;
    this.attachments = data.attachments;
    this.embeds = data.embeds;
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
    this.thread = data.thread ? new Channel(this.client, data.thread) : undefined;
    this.components = data.components;
    this.stickerItems = data.sticker_items;
    this.position = data.position;
  }

  // public async delete() {}
  // public async edit() {}
  // public async fetch() {}
  // public async react() {}
  // public async reply() {}
  // public async pin() {}
  // public async unpin() {}
  // public async awaitMessageComponent() {}
  // public async createMessageComponentCollector() {}
  // public async startThread() {}

  public toString(): string {
    return this.content;
  }
}