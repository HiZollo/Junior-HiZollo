import { Client, VoiceChannelBase } from "..";
import { APIGuildStageVoiceChannel, APIStageInstance, ChannelType } from "../../types/types";

export class GuildStageVoiceChannel extends VoiceChannelBase<ChannelType.GuildStageVoice> {
  public stageInstance: APIStageInstance | null;

  constructor(client: Client, data: APIGuildStageVoiceChannel) {
    super(client, data);

    this.stageInstance = null;
  }

  // public async createStageInstance() {}
}