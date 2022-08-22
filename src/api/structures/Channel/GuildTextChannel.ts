import { Client, GuildChannel } from "..";
import { GuildTextChannelPatchOptions } from "../../types/interfaces";
import { APIGuildTextChannel, GuildTextChannelType } from "../../types/types";
import { ChannelUtil } from "../../utils";

export abstract class GuildTextChannel<T extends GuildTextChannelType> extends ChannelUtil.ApplyTextBased(GuildChannel)<T> {
  public topic: string | null;

  constructor(client: Client, data: APIGuildTextChannel<T>) {
    super(client, data);
    this.topic = data.topic ?? null;
  }

  // public async bulkDelete(messages, filterOld = false) {}
  // public async fetchWebhooks() {}
  // public async createWebhook(options) {}

  public patch(data: GuildTextChannelPatchOptions): this {
    super.patch(data);

    if ('topic' in data) {
      this.topic = data.topic ?? null;
    }
    return this;
  }
}