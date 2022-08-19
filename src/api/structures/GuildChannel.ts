import { Client, ChannelBase } from ".";
import { GuildChannelEditOptions } from "../types/interfaces";
import { APIGuildChannel, APIOverwrite, ChannelType, Routes } from "../types/types";

export abstract class GuildChannel<T extends ChannelType> extends ChannelBase<T> {
  public name?: string;
  public guildId?: string;
  public nsfw?: boolean;
  public parentId?: string | null;
  public permissionOverwrites?: APIOverwrite[];
  public position?: number;

  constructor(client: Client, data: APIGuildChannel<T>) {
    super(client, data);
    this.patch(data);
  }

  public async edit(options: GuildChannelEditOptions): Promise<this> {
    const data = await this.client.rest.patch(Routes.channel(this.id), {
      body: {
        name: options.name ?? this.name, 
        type: options.type ?? this.type, 
        position: options.position, 
        topic: options.topic, 
        nsfw: options.nsfw, 
        rate_limit_per_user: options.rateLimitPerUser, 
        bitrate: options.bitrate, 
        user_limit: options.userLimit, 
        permission_overwrite: options.permissionOverwrite, 
        parent_id: options.parentId, 
        rtc_region: options.rtcRegion, 
        video_quality_mode: options.videoQualityMode, 
        default_auto_archive_duration: options.defaultAutoArchiveDuration
      }, 
      reason: options.reason
    }) as APIGuildChannel<T>;

    this.patch(data);
    return this;
  }

  // public async permissionsFor(member: GuildMember): PermissionsBitField {} // TODO: GuildMember, PermissionsBitField

  protected patch(data: APIGuildChannel<T>): this {
    super.patch(data);
    this.type = data.type;
    this.name = data.name;
    this.guildId = data.guild_id;
    this.nsfw = data.nsfw;
    this.parentId = data.parent_id;
    this.permissionOverwrites = data.permission_overwrites;
    this.position = data.position;
    return this;
  }
}
