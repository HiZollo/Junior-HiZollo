import { ChannelBase, Client, GuildMember, Permissions } from "..";
import { GuildChannelPatchOptions } from "../../types/interfaces";
import { APIGuildChannel, APIOverwrite, ChannelType } from "../../types/types";

export abstract class GuildChannel<T extends ChannelType> extends ChannelBase<T> {
  public name: string | null;
  public guildId: string | null;
  public parentId: string | null;
  public permissionOverwrites: APIOverwrite[];

  constructor(client: Client, data: APIGuildChannel<T>) {
    super(client, data);
    this.name = data.name ?? null;
    this.guildId = data.guild_id ?? null;
    this.parentId = data.parent_id ?? null;
    this.permissionOverwrites = data.permission_overwrites ?? [];
  }

  public permissionsFor(member: GuildMember): Permissions | null {
    const permissions = member.guildPermissions;
    if (!permissions) return null;

    let everyoneOverwrites: APIOverwrite | void;
    let roleOverwrites: APIOverwrite[] = [];
    let memberOverwrites: APIOverwrite | void;

    for (const perm of this.permissionOverwrites) {
      if (perm.id === this.guildId) {
        everyoneOverwrites = perm;
      }
      else if (perm.id === member.user.id) {
        memberOverwrites = perm;
      }
      else if (member.roleIds.includes(perm.id)) {
        roleOverwrites.push(perm);
      }
    }
    
    return permissions
      .remove(everyoneOverwrites?.deny ?? 0n)
      .add(everyoneOverwrites?.allow ?? 0n)
      .remove(Permissions.resolve(roleOverwrites.map(o => o.deny)) ?? 0n)
      .add(Permissions.resolve(roleOverwrites.map(o => o.allow)) ?? 0n)
      .remove(memberOverwrites?.deny ?? 0n)
      .add(memberOverwrites?.allow ?? 0n);
  }

  public patch(data: GuildChannelPatchOptions): this {
    super.patch(data);

    if ('name' in data) {
      this.name = data.name ?? null;
    }
    if ('guild_id' in data) {
      this.guildId = data.guild_id ?? null;
    }
    if ('parent_id' in data) {
      this.parentId = data.parent_id ?? null;
    }
    if ('permission_overwrites' in data) {
      this.permissionOverwrites = data.permission_overwrites ?? [];
    }
    return this;
  }
}
