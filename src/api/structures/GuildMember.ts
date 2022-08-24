import { Client, Permissions } from ".";
import { APIGuildMember, APIUser } from "../types/types";

export class GuildMember {
  public client: Client;
  public guildId: string;
  public user: APIUser;
  public nickname: string | null;
  public avatar: string | null;
  public roleIds: string[];
  public joinedAt: string;
  public permiumSince: string | null;
  public deaf: boolean;
  public mute: boolean;
  public permissions: string | null;
  public communicationDisabledUntil: string | null;

  constructor(client: Client, data: APIGuildMember & { guildId: string, user: APIUser, permissions?: string }) {
    this.client = client;
    this.guildId = data.guildId;
    this.user = data.user;
    this.nickname = data.nick ?? null;
    this.avatar = data.avatar ?? null;
    this.roleIds = data.roles;
    this.joinedAt = data.joined_at;
    this.permiumSince = data.premium_since ?? null;
    this.deaf = data.deaf;
    this.mute = data.mute;
    this.permissions = data.permissions ?? null;
    this.communicationDisabledUntil = data.communication_disabled_until ?? null;
  }

  /**
   * 訊息發送者在伺服器中的綜合權限，不考慮頻道覆寫。
   * 如果訊息不在伺服器中，或伺服器沒被快取則回傳 null。
   */
  get guildPermissions(): Permissions | null {
    const guild = this.client.guilds.get(this.guildId);
    if (!guild) return null;

    if (this.user.id === guild.ownerId) return new Permissions(Permissions.All);

    const roles = [...guild.roles.values()].filter(r => this.roleIds.includes(r.id));
    return new Permissions(roles.reduce((acc, cur) => acc | BigInt(cur.permissions), 0n));
  }
}