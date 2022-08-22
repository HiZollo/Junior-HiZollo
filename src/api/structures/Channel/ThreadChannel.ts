import { Client, GuildChannel } from "..";
import { APIThreadChannel, APIThreadMember, APIThreadMetadata, ChannelType } from "../../types/types";
import { ChannelUtil } from "../../utils";

export class ThreadChannel extends ChannelUtil.ApplyTextBased(GuildChannel)<ChannelType.GuildPublicThread | ChannelType.GuildPrivateThread | ChannelType.GuildNewsThread> {
  public member?: APIThreadMember;
  public ownerId?: string;
  public threadMetadata?: APIThreadMetadata;

  constructor(client: Client, data: APIThreadChannel) {
    super(client, data);

    this.member = data.member;
    this.ownerId = data.owner_id;
    this.threadMetadata = data.thread_metadata;
  }
}