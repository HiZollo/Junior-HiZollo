import { Client } from "..";
import { TextChannelPatchOptions } from "../../types/interfaces";
import { APITextChannel, ChannelType } from "../../types/types";
import { GuildTextChannel } from "./GuildTextChannel";

export class TextChannel extends GuildTextChannel<ChannelType.GuildText> {
  public rateLimitPerUser?: number;

  constructor(client: Client, data: APITextChannel) {
    super(client, data);
    this.rateLimitPerUser = data.rate_limit_per_user;
  }

  public patch(data: TextChannelPatchOptions): this {
    super.patch(data);

    if (data.rate_limit_per_user) {
      this.rateLimitPerUser = data.rate_limit_per_user;
    }
    return this;
  }
}