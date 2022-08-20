/* Waiting @discordjs/ws for discord-api-types^0.37.2 support */

// import { Client, VoiceChannelBase } from ".";
// import { APIGuildVoiceChannel, ChannelType, VideoQualityMode } from "../types/types";
// import { ChannelUtil } from "../utils";

// export class GuildVoiceChannel extends ChannelUtil.ApplyTextBased(VoiceChannelBase)<ChannelType.GuildVoice> {
//   public videoQualityMode?: VideoQualityMode;

//   constructor(client: Client, data: APIGuildVoiceChannel) {
//     super(client, data);

//     this.videoQualityMode = data.video_quality_mode;
//   }

//   // get joinable(): boolean {}
//   // get speakable(): boolean {}

//   // public async send(options: MessageOptions): Promise<Message> {}
//   // public async sendTyping(): Promise<void> {}
//   // public async createMessageCollector(options = {}) {}
//   // public async awaitMessages(options = {}) {}
//   // public async createMessageComponentCollector(options = {}) {}
//   // public async awaitMessageComponent(options = {}) {}
//   // public async bulkDelete(messages, filterOld = false) {}
//   // public async fetchWebhooks() {}
//   // public async createWebhook(options) {}
// }