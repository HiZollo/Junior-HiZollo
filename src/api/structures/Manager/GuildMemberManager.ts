import { Client, Guild } from "..";
import { GuildMemberCache } from "../../types/interfaces";
import { APIGuildMember } from "../../types/types";

export class GuildMemberManager {
  public client!: Client;
  public guild: Guild;
  public cache: Map<string, GuildMemberCache>;

  constructor(client: Client, guild: Guild) {
    Object.defineProperty(this, 'client', { value: client });

    this.guild = guild;
    this.cache = new Map();
  }

  update(id: string, data: Omit<APIGuildMember, "user">): GuildMemberCache | void {
    let cacheData = { nickname: data.nick ?? null, id };
    this.cache.set(id, cacheData);
    return cacheData;
  }
}