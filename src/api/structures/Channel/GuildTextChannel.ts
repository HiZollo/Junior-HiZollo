import { Client, GuildChannel } from "..";
import { APIGuildTextChannel, GuildTextChannelType, ThreadAutoArchiveDuration } from "../../types/types";
import { ChannelUtil } from "../../utils";

export abstract class GuildTextChannel<T extends GuildTextChannelType> extends ChannelUtil.ApplyTextBased(GuildChannel)<T> {
  public defaultAutoArchiveDuration?: ThreadAutoArchiveDuration;
  public topic?: string | null;

  constructor(client: Client, data: APIGuildTextChannel<T>) {
    super(client, data);
    this.patch(data);
  }

  // public async bulkDelete(messages, filterOld = false) {}
  // public async fetchWebhooks() {}
  // public async createWebhook(options) {}

  protected patch(data: APIGuildTextChannel<T>): this {
    super.patch(data);
    this.defaultAutoArchiveDuration = data.default_auto_archive_duration;
    this.topic = data.topic;
    return this;
  }
}