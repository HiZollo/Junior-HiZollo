import { APIGuildChannel, ChannelType } from "discord.js";
import { Client, ChannelBase } from ".";
import { APIOverwrite } from "../types/types";

export abstract class GuildChannel<T extends ChannelType> extends ChannelBase<T> {
  public type: T;
  public name?: string | null;
  public guildId?: string;
  public nsfw?: boolean;
  public parentId?: string | null;
  public permissionOverwrites?: APIOverwrite[];
  public position?: number;

  constructor(client: Client, data: APIGuildChannel<T>) {
    super(client, data);

    this.type = data.type;
    this.name = data.name;
    this.guildId = data.guild_id;
    this.nsfw = data.nsfw;
    this.parentId = data.parent_id;
    this.permissionOverwrites = data.permission_overwrites;
    this.position = data.position;
  }

  // public async edit() {}
  // public async permissionsFor() {}
}
