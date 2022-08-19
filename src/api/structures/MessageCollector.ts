import { Collector } from "."
import { ClientEvents } from "../types/enum";
import { MessageCollectorOptions } from "../types/interfaces"
import { APIChannel, APIGuild, APIMessage, APIThreadChannel, CollectorEndReason } from "../types/types"

export class MessageCollector extends Collector<string, APIMessage> {
  public channelId: string;
  public guildId?: string;

  constructor(options: MessageCollectorOptions) {
    super(options);

    this.channelId = options.channelId;
    this.guildId = options.guildId;

    this.client.on(ClientEvents.MessageCreate, this.onCollect);
    this.client.on(ClientEvents.ChannelDelete, this.onChannelDelete);
    this.client.on(ClientEvents.ThreadDelete, this.onThreadDelete);
    if (this.guildId) {
      this.client.on(ClientEvents.GuildDelete, this.onGuildDelete);
    }
  }

  public end(reason?: CollectorEndReason): void {
    super.end(reason);

    this.client.off(ClientEvents.MessageCreate, this.onCollect);
    this.client.off(ClientEvents.ChannelDelete, this.onChannelDelete);
    this.client.off(ClientEvents.GuildDelete, this.onGuildDelete);
    this.client.off(ClientEvents.ThreadDelete, this.onThreadDelete);
  }

  protected collect(rawMessage: APIMessage): [key: string, value: APIMessage] | null {
    return rawMessage.channel_id === this.channelId ? [rawMessage.id, rawMessage] : null;
  }

  private onChannelDelete(rawChannel: APIChannel): void {
    if (rawChannel.id === this.channelId) {
      this.end('channelDelete');
    }
  }

  private onGuildDelete(rawGuild: APIGuild): void {
    if (rawGuild.id === this.guildId) {
      this.end('guildDelete');
    }
  }

  private onThreadDelete(rawThread: APIThreadChannel): void {
    if (rawThread.id === this.channelId) {
      this.end('threadDelete');
    }
  }
}