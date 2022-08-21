import { Client, Guild } from "..";
import { GatewayGuildCreateDispatchData } from "../../types/types";

export class GuildManager {
  public client!: Client;
  public cache: Map<string, Guild>;

  constructor(client: Client) {
    Object.defineProperty(this, 'client', { value: client });

    this.cache = new Map();
  }

  public get(guildId: string): Guild | undefined {
    return this.cache.get(guildId);
  }

  public add(data: Partial<GatewayGuildCreateDispatchData> & { id: string }): Guild {
    const guild = new Guild(this.client, data);
    this.cache.set(data.id, guild);
    return guild;
  }

  public remove(guildId: string): boolean {
    return this.cache.delete(guildId);
  }
}