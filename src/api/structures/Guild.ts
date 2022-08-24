import { Client } from ".";
import { APIGuildMember, APIRole, GatewayGuildCreateDispatchData, Routes } from "../types/types";

export class Guild {
  public client!: Client;
  public name!: string;
  public id!: string;
  public ownerId!: string;
  public roles!: Map<string, APIRole>;
  public available!: boolean;

  constructor(client: Client, data: Partial<GatewayGuildCreateDispatchData>) {
    Object.defineProperty(this, 'client', { value: client });

    this.available = false;
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

  public patch(data: Partial<GatewayGuildCreateDispatchData>): this {
    if (data.name) {
      this.name = data.name;
    }
    if (data.roles) {
      this.roles = new Map(data.roles.map(r => [r.id, r]));
    }
    if (data.owner_id) {
      this.ownerId = data.owner_id;
    }
    this.available ||= Boolean(data.roles);
    return this;
  }
}