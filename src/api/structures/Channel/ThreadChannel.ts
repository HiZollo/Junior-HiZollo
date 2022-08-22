import { Client, GuildChannel } from "..";
import { ThreadChannelPatchOptions } from "../../types/interfaces";
import { APIThreadChannel, APIThreadMember, APIThreadMetadata, ChannelType } from "../../types/types";
import { ChannelUtil } from "../../utils";

export class ThreadChannel extends ChannelUtil.ApplyTextBased(GuildChannel)<ChannelType.GuildPublicThread | ChannelType.GuildPrivateThread | ChannelType.GuildNewsThread> {
  public member: APIThreadMember | null;
  public ownerId: string | null;
  public threadMetadata: APIThreadMetadata | null;

  constructor(client: Client, data: APIThreadChannel) {
    super(client, data);

    this.member = data.member ?? null;
    this.ownerId = data.owner_id ?? null;
    this.threadMetadata = data.thread_metadata ?? null;
  }

  public patch(data: ThreadChannelPatchOptions): this {
    super.patch(data);

    if ('member' in data) {
      this.member = data.member ?? null;
    }
    if ('thread_metadata' in data) {
      this.threadMetadata = data.thread_metadata ?? null;
    }
    return this;
  }
}