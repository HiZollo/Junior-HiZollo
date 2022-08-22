import { ChannelBase, Client } from "..";
import { GuildChannelEditOptions, GuildChannelPatchOptions } from "../../types/interfaces";
import { APIGuildChannel, APIOverwrite, ChannelType, Routes } from "../../types/types";

export abstract class GuildChannel<T extends ChannelType> extends ChannelBase<T> {
  public name?: string;
  public guildId?: string;
  public parentId?: string | null;
  public permissionOverwrites?: APIOverwrite[];

  constructor(client: Client, data: APIGuildChannel<T>) {
    super(client, data);
    this.name = data.name;
    this.guildId = data.guild_id;
    this.parentId = data.parent_id;
    this.permissionOverwrites = data.permission_overwrites;
  }

  public async edit(options: GuildChannelEditOptions): Promise<this> {
    await this.client.rest.patch(Routes.channel(this.id), {
      body: {
        name: options.name ?? this.name, 
        type: options.type ?? this.type, 
        topic: options.topic, 
        rate_limit_per_user: options.rateLimitPerUser, 
        bitrate: options.bitrate, 
        user_limit: options.userLimit, 
        permission_overwrite: options.permissionOverwrite, 
        parent_id: options.parentId, 
        rtc_region: options.rtcRegion, 
        video_quality_mode: options.videoQualityMode
      }, 
      reason: options.reason
    }) as APIGuildChannel<T>;
    return this;
  }

  // public async permissionsFor(member: GuildMember): PermissionsBitField {} // TODO: GuildMember, PermissionsBitField

  public patch(data: GuildChannelPatchOptions): this {
    super.patch(data);

    if (data.name) {
      this.name = data.name;
    }
    if (data.guild_id) {
      this.guildId = data.guild_id;
    }
    if (data.parent_id) {
      this.parentId = data.parent_id;
    }
    if (data.permission_overwrites) {
      this.permissionOverwrites = data.permission_overwrites;
    }
    return this;
  }
}
