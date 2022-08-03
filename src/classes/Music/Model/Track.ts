import { AudioResource, createAudioResource } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import ytpl, { InfoData } from "play-dl";
import { TrackOptions } from "../../../utils/interfaces";

export class Track {
  public info: InfoData;
  public resource: AudioResource;
  public requester: GuildMember;
  public looping: boolean;

  public title: string;
  public url: string;
  public videoLink: string;
  public description: string;
  public views: number;
  public thumbnailUrl: string;
  public length: number;

  public channelLink: string;
  public uploadedAt: string;

  constructor({ requester, stream, info }: TrackOptions) {
    this.info = info;
    this.resource = createAudioResource(stream.stream, { inputType: stream.type });
    this.requester = requester;
    this.looping = false;

    this.title = info.video_details.title ?? '[無法取得標題內容]';
    this.url = info.video_details.url;
    this.videoLink = `[${this.title}](${this.url})`;
    this.description = info.video_details.description ?? '[無影片描述]';
    this.views = info.video_details.views;
    this.thumbnailUrl = this.getMaxThumbnail(info.video_details.thumbnails).url;
    this.length = info.video_details.durationInSec;

    this.channelLink = info.video_details.channel && info.video_details.channel.url ? 
      `[${info.video_details.channel.name ?? '無法取得頻道名稱'}](${info.video_details.channel.url})` : 
      '[無法取得頻道資料]'
    this.uploadedAt = info.video_details.uploadedAt ?? '[無法取得上傳時間]';
  }

  public async renewResource() {
    const stream = await ytpl.stream(this.info.video_details.url);
    this.resource = createAudioResource(stream.stream, { inputType: stream.type });
  }

  public toggleLoop() {
    this.looping = !this.looping;
  }

  private getMaxThumbnail<T extends { width: number }>(thumbnails: T[]): T { // 他們沒有 export YouTubeThumbnail 所以要用泛型 :lye:
    let maxWidth = -1, maxIndex = -1;
    for (let i = 0; i < thumbnails.length; i++) {
      if (thumbnails[i].width > maxWidth) {
        maxIndex = i;
        maxWidth = thumbnails[i].width;
      }
    }
    return thumbnails[maxIndex];
  }
}