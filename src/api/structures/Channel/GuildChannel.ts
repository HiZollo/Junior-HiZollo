import { ChannelBase, Client } from "..";
import { GuildChannelPatchOptions } from "../../types/interfaces";
import { APIGuildChannel, APIOverwrite, ChannelType } from "../../types/types";

export abstract class GuildChannel<T extends ChannelType> extends ChannelBase<T> {
  public name: string | null;
  public guildId: string | null;
  public parentId: string | null;
  public permissionOverwrites: APIOverwrite[] | null;

  constructor(client: Client, data: APIGuildChannel<T>) {
    super(client, data);
    this.name = data.name ?? null;
    this.guildId = data.guild_id ?? null;
    this.parentId = data.parent_id ?? null;
    this.permissionOverwrites = data.permission_overwrites ?? null;
  }

  // public async permissionsFor(member: GuildMember): PermissionsBitField {} // TODO: GuildMember, PermissionsBitField

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
      this.permissionOverwrites = data.permission_overwrites ?? null;
    }
    return this;
  }
}
