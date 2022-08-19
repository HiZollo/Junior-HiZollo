import { Client, GuildChannel } from ".";
import { APIThreadChannel, APIThreadMember, APIThreadMetadata, ChannelType } from "../types/types";

export class ThreadChannel extends GuildChannel<ChannelType.GuildPublicThread | ChannelType.GuildPrivateThread | ChannelType.GuildNewsThread> {
  public rateLimitPerUser?: number;
  public member?: APIThreadMember;
  public memberCount?: number;
  public messageCount?: number;
  public ownerId?: string;
  public threadMetadata?: APIThreadMetadata;
  public totalMessageSent?: number;

  constructor(client: Client, data: APIThreadChannel) {
    super(client, data);

    this.rateLimitPerUser = data.rate_limit_per_user;
    this.member = data.member;
    this.memberCount = data.member_count;
    this.messageCount = data.message_count;
    this.ownerId = data.owner_id;
    this.threadMetadata = data.thread_metadata;
    this.totalMessageSent = data.total_message_sent;
  }
}