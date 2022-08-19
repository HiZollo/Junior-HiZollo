import { TextBasedChannel, TextBasedChannelSendOptions } from "../types/interfaces";
import { Client, GuildChannel, Message } from ".";
import { APIGuildTextChannel, APIMessage, GuildTextChannelType, Routes, ThreadAutoArchiveDuration } from "../types/types";
import { MessageUtil } from "../utils/MessageUtil";

export abstract class GuildTextChannel<T extends GuildTextChannelType> extends GuildChannel<T> implements TextBasedChannel {
  public defaultAutoArchiveDuration?: ThreadAutoArchiveDuration;
  public topic?: string | null;

  constructor(client: Client, data: APIGuildTextChannel<T>) {
    super(client, data);
    this.patch(data);
  }

  public async send(message: TextBasedChannelSendOptions | string): Promise<Message> {
    const body = typeof message === 'string' ? { content: message } : MessageUtil.resolveBody(message);
    const files = typeof message === 'string' ? [] : await MessageUtil.resolveFiles(message.files ?? []);

    const data = await this.client.rest.post(Routes.channelMessages(this.id), { body, files }) as APIMessage;
    return new Message(this.client, data);
  }

  // public async createMessageCollector(options = {}) {}
  // public async awaitMessages(options = {}) {}
  // public async createMessageComponentCollector(options = {}) {}
  // public async awaitMessageComponent(options = {}) {}
  // public async bulkDelete(messages, filterOld = false) {}
  // public async fetchWebhooks() {}
  // public async createWebhook(options) {}

  protected patch(data: APIGuildTextChannel<T>): this {
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.topic = data.topic;
    return this;
  }
}