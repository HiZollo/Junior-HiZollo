import { APIAllowedMentions, APIEmbed, APIMessage, APIMessageComponent, APIMessageReference, APIOverwrite, APIThreadMember, APIThreadMetadata, Awaitable, ChannelType, GatewayIntentBits, MessageFlags } from "./types";
import { Client, Message, MessageCollector } from "../structures";


export interface ClientOptions {
  id: string;
  token: string;
  intents: GatewayIntentBits;
}

export interface ChannelBasePatchOptions {
  type: ChannelType;
  id: string;
}

export interface GuildChannelPatchOptions extends ChannelBasePatchOptions {
  name?: string | null;
  guild_id?: string;
  parent_id?: string | null;
  permission_overwrites?: APIOverwrite[];
}

export interface GuildTextChannelPatchOptions extends GuildChannelPatchOptions {
  topic?: string | null;
}

export interface ThreadChannelPatchOptions extends GuildChannelPatchOptions {
  member?: APIThreadMember | null;
  thread_metadata ?: APIThreadMetadata | null;
}


export interface FileOptions {
  attachment: string | Buffer;
  name?: string;
  description?: string;
}

export interface BaseMessageOptions {
  content?: string;
  embeds?: APIEmbed[];
  components?: APIMessageComponent[];
  allowedMentions?: APIAllowedMentions;
  files?: FileOptions[];
}

export interface TextBasedChannelSendOptions extends BaseMessageOptions {
  tts?: boolean;
  stickerIds?: string[];
}

export interface InteractionReplyOptions extends BaseMessageOptions {
  ephemeral?: boolean;
}

export interface InteractionDeferOptions extends BaseMessageOptions {
  ephemeral?: boolean;
  fetchReply?: boolean;
}

export interface APIMessagePatchBodyAttachment {
  id: string;
  filename: string;
  descrpition?: string;
}

export interface APIMessagePatchBody {
  content?: string;
  tts?: boolean;
  embeds?: APIEmbed[];
  allowed_mentions?: APIAllowedMentions;
  message_reference?: APIMessageReference;
  components?: APIMessageComponent[];
  sticker_ids?: string[];
  attachments?: APIMessagePatchBodyAttachment[];
  flags?: MessageFlags;
}

export interface CollectorOptions {
  client: Client;
  filter?: (...args: unknown[]) => Awaitable<boolean>;
  max?: number;
  time?: number;
  idle?: number;
}

export interface MessageCollectorOptions extends CollectorOptions {
  channelId: string;
  guildId?: string;
}

export interface InteractionCollectorOptions extends CollectorOptions {
  messageId?: string;
  channelId?: string;
  guildId?: string;
}

export interface TextBasedChannel {
  send(options: TextBasedChannelSendOptions | string): Promise<Message>;
  createMessageCollector(options: CollectorOptions): MessageCollector;
  awaitMessages(options: CollectorOptions): Promise<Map<string, APIMessage>>;
}

export interface RepliableInteraction {
  deferred: boolean;
  replied: boolean;
  reply(options: InteractionReplyOptions | string): Promise<Message>;
  deferReply(options?: InteractionDeferOptions): Promise<Message | void>;
  editReply(options: BaseMessageOptions | string): Promise<Message>;
  fetchReply(): Promise<Message>;
  deleteReply(): Promise<void>;
  followUp(options: InteractionReplyOptions | string): Promise<Message>;
}