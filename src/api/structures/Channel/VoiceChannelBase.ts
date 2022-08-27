import { Client, GuildChannel } from "..";
import { APIVoiceChannelBase, ChannelType } from "../../types/types";

export abstract class VoiceChannelBase<T extends ChannelType.GuildVoice | ChannelType.GuildStageVoice> extends GuildChannel<T> {
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