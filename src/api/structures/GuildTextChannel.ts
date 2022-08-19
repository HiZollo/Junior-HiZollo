import { TextBasedChannel } from "../types/interfaces";
import { Client, GuildChannel } from ".";
import { APIGuildTextChannel, GuildTextChannelType, ThreadAutoArchiveDuration } from "../types/types";

export abstract class GuildTextChannel<T extends GuildTextChannelType> extends GuildChannel<T> implements TextBasedChannel {
  public lastMessageId?: string | null;
  public defaultAutoArchiveDuration?: ThreadAutoArchiveDuration;
  public lastPinTimestamp?: string | null;
  public topic?: string | null;

  constructor(client: Client, data: APIGuildTextChannel<T>) {
    super(client, data);

    this.lastMessageId = data.last_message_id;
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.lastPinTimestamp = data.last_pin_timestamp;
    this.topic = data.topic;
  }

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