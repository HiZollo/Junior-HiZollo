import { Client } from "..";
import { APITextChannel, ChannelType } from "../../types/types";
import { GuildTextChannel } from "./GuildTextChannel";

export class TextChannel extends GuildTextChannel<ChannelType.GuildText> {
  public rateLimitPerUser?: number;

  constructor(client: Client, data: APITextChannel) {
    super(client, data);
    this.patch(data);
  }

  protected patch(data: APITextChannel): this {
    super.patch(data);
    this.rateLimitPerUser = data.rate_limit_per_user;
    return this;
  }
}