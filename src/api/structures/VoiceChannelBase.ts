import { VoiceBasedChannelTypes } from "discord.js";
import { APIVoiceChannelBase } from "../types/types";
import { Client, GuildChannel } from ".";

export abstract class VoiceChannelBase<T extends VoiceBasedChannelTypes> extends GuildChannel<T> {
  public bitrate?: number;
  public rtcRegion?: string | null;
  public userLimit?: number;

  constructor(client: Client, data: APIVoiceChannelBase<T>) {
    super(client, data);

    this.bitrate = data.bitrate;
    this.rtcRegion = data.rtc_region;
    this.userLimit = data.user_limit;
  }

  // get members(): GuildMember {}
  // get full(): boolean {}
  // get joinable(): boolean {}
}