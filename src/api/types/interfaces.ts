import { APIAllowedMentions, APIEmbed, APIMessageComponent, APIMessageReference, APIOverwrite, ChannelType, GatewayIntentBits, MessageFlags, ThreadAutoArchiveDuration, VideoQualityMode } from "./types";
import { Message } from "../structures";


export interface TextBasedChannel {
  send(options: TextBasedChannelSendOptions | string): Promise<Message>;
  createMessageCollector(options: MessageCollectorOptions): Promise<void>;
  awaitMessages(options: MessageCollectorOptions): Promise<void>;
  createMessageComponentCollector(options: MessageComponentCollectorOptions): Promise<void>;
  awaitMessageComponent(options: MessageComponentCollectorOptions): Promise<void>;
}

export interface ClientOptions {
  token: string;
  intents: GatewayIntentBits;
}

export interface GuildChannelEditOptions {
  name: string;
  type: ChannelType;
  position?: number;
  topic?: string | null;
  nsfw?: boolean | null;
  rateLimitPerUser?: number;
  bitrate?: number;
  userLimit?: number;
  permissionOverwrite?: APIOverwrite[];
  parentId?: string;
  rtcRegion?: string;
  videoQualityMode?: VideoQualityMode;
  defaultAutoArchiveDuration?: ThreadAutoArchiveDuration;
  reason?: string;
}

export interface FileOptions {
  attachment: string | Buffer;
  name?: string;
  description?: string;
}

export interface TextBasedChannelSendOptions {
  content?: string;
  tts?: boolean;
  embeds?: APIEmbed[];
  allowedMentions?: APIAllowedMentions;
  messageReference?: APIMessageReference;
  components?: APIMessageComponent[];
  stickerIds?: string[];
  files?: FileOptions[];
  flags?: MessageFlags;
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