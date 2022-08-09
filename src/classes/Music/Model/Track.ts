import { AudioResource, createAudioResource } from "@discordjs/voice";
import { GuildMember } from "discord.js";
import ytpl, { InfoData } from "play-dl";
import { TrackOptions } from "../../../utils/interfaces";

/**
 * 代表一首歌曲
 */
export class Track {
  /**
   * 歌曲的相關資料
   */
  public info: InfoData;

  /**
   * 歌曲的音訊資源
   */
  public resource: AudioResource;

  /**
   * 歌曲的點歌者
   */
  public requester: GuildMember;

  /**
   * 歌曲是否正在重複播放
   */
  public looping: boolean;

  /**
   * 歌曲的標題
   */
  public title: string;

  /**
   * 歌曲的連結
   */
  public url: string;

  /**
   * 歌曲的 Markdown 連結
   */
  public videoLink: string;

  /**
   * 歌曲的詳細資訊
   */
  public description: string;

  /**
   * 歌曲的觀看次數
   */
  public views: number;

  /**
   * 歌曲的縮圖
   */
  public thumbnailUrl: string;

  /**
   * 歌曲的時長，單位為秒
   */
  public length: number;

  /**
   * 上傳這首歌曲的頻道 Markdown 連結
   */
  public channelLink: string;

  /**
   * 歌曲的上傳時間
   */
  public uploadedAt: string;

  /**
   * 建立一首歌曲
   * @param options 設定參數 
   */
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

  /**
   * 重新載入這首歌曲的音訊資源
   */
  public async renewResource() {
    const stream = await ytpl.stream(this.info.video_details.url);
    this.resource = createAudioResource(stream.stream, { inputType: stream.type });
  }

  /**
   * 切換歌曲的重播狀態
   */
  public toggleLoop() {
    this.looping = !this.looping;
  }

  /**
   * 在所有縮圖中取得解析度最高的一個
   * @param thumbnails 所有縮圖
   * @returns 解析度最高的縮圖
   */
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