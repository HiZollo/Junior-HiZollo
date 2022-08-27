import { Client } from "..";
import { APIChannel, Channel } from "../../types/types";
import { ChannelUtil } from "../../utils";

export class ChannelManager {
  public client!: Client;
  public cache: Map<string, Channel>;

  constructor(client: Client) {
    Object.defineProperty(this, 'client', { value: client });

    this.cache = new Map();
  }

  public get(channelId: string): Channel | undefined {
    return this.cache.get(channelId);
  }

  public has(channelId: string): boolean {
    return this.cache.has(channelId);
  }

  public add(data: APIChannel): Channel | null {
    const channel = ChannelUtil.createChannel(this.client, data);
    this.cache.set(data.id, channel);
    return channel;
  }

  public remove(guildId: string): boolean {
    return this.cache.delete(guildId);
  }
}