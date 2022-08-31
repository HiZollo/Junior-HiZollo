import { Client, GuildMemberManager } from ".";
import { APIGuildMember, APIRole, GatewayGuildCreateDispatchData, Routes } from "../types/types";

export class Guild {
  public client!: Client;
  public name!: string;
  public id!: string;
  public shardId!: number;
  public ownerId!: string;
  public roles!: Map<string, APIRole>;
  public members!: GuildMemberManager;
  public memberCount!: number;
  public available!: boolean;

  constructor(client: Client, data: Partial<GatewayGuildCreateDispatchData> & { shard_id: number }) {
    Object.defineProperty(this, 'client', { value: client });

    this.available = false;
    this.members = new GuildMemberManager(client, this);
    this.patch(data);
  }

  private _me: APIGuildMember | null = null;
  public async getMe(force: boolean = false): Promise<APIGuildMember> {
    if (this._me && !force) return this._me;

    const data = await this.client.rest.get(Routes.guildMember(this.id, this.client.id)) as APIGuildMember;
    return this.patchMe(data);
  }

  public patchMe(data: APIGuildMember): APIGuildMember {
    return this._me = data;
  }

  public patch(data: Partial<GatewayGuildCreateDispatchData & { shard_id: number }>): this {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.roles !== undefined) {
      this.roles = new Map(data.roles.map(r => [r.id, r]));
    }
    if (data.id !== undefined) {
      this.id = data.id;
    }
    if (data.shard_id !== undefined) {
      this.shardId = data.shard_id;
    }
    if (data.owner_id !== undefined) {
      this.ownerId = data.owner_id;
    }
    if (data.members !== undefined) {
      data.members.forEach(m => {
        if (m.user?.id) {
          this.members.update(m.user.id, m);
        }
      });
    }
    if (data.member_count !== undefined) {
      this.memberCount = data.member_count;
    }
    this.available ||= Boolean(data.roles);
    return this;
  }
}