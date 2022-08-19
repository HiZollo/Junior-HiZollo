import { Client, VoiceChannelBase } from ".";
import { TextBasedChannel } from "../types/interfaces";
import { APIGuildVoiceChannel, ChannelType, VideoQualityMode } from "../types/types";

export class GuildVoiceChannel extends VoiceChannelBase<ChannelType.GuildVoice> implements TextBasedChannel {
  public lastMessageId?: string | null;
  public videoQualityMode?: VideoQualityMode;

  constructor(client: Client, data: APIGuildVoiceChannel) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.videoQualityMode = data.video_quality_mode;
  }

  // get joinable(): boolean {}
  // get speakable(): boolean {}

  // public async send(options: MessageOptions): Promise<Message> {}
  // public async sendTyping(): Promise<void> {}
  // public async createMessageCollector(options = {}) {}
  // public async awaitMessages(options = {}) {}
  // public async createMessageComponentCollector(options = {}) {}
  // public async awaitMessageComponent(options = {}) {}
  // public async bulkDelete(messages, filterOld = false) {}
  // public async fetchWebhooks() {}
  // public async createWebhook(options) {}
}