/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { ChannelType, Guild, GuildTextBasedChannel, PermissionsBitField, VoiceBasedChannel, VoiceState } from "discord.js";
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, VoiceConnection } from "@discordjs/voice";
import { HZClient } from "../../../classes/HZClient";
import { GuildMusicManagerOptions } from "../../../utils/interfaces";
import { YoutubeUtil } from "./YoutubeUtil";
import ytpl, { InfoData, YouTubeStream } from "play-dl";
import { Track } from "./Track";
import { GuildMusicController } from "../Controller/GuildMusicController";
import { MusicViewRenderer } from "../View/MusicViewRenderer";
import { Source } from "../../../classes/Source";
import { MusicLoopState } from "@root/src/utils/enums";

/**
 * 掌管單個伺服器下的音樂系統
 */
export class GuildMusicManager {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 此系統所在的伺服器
   */
  public guild: Guild;

  /**
   * 告知使用者音樂系統狀態的顯示器
   */
  public view: MusicViewRenderer;

  /**
   * 跟音樂系統連接的語音頻道
   */
  public voiceChannel: VoiceBasedChannel;

  /**
   * 與音樂系統綁定的文字頻道
   */
  public textChannel: GuildTextBasedChannel;

  /**
   * 機器人的語音狀態
   */
  public voiceState: VoiceState;

  /**
   * 在舞台頻道中，進入閒置狀態時是否自動退下舞台
   */
  public autoSuppress: boolean;

  /**
   * 機器人在這個伺服器語音連線，可以訂閱至單個播放器並播放其音訊
   */
  public connection: VoiceConnection;

  /**
   * 用來播放音訊的播放器
   */
  public player: AudioPlayer;

  /**
   * 這個伺服器的待播清單，不含正在播放的歌曲
   */
  public queue: Track[];

  /**
   * 這個伺服器正在播放的歌曲
   */
  public nowPlaying: Track | null;

  /**
   * 這個伺服器的播放器是否運作中，暫停也視為運作中
   */
  public working: boolean;

  /**
   * 這個伺服器的播放器是否處於暫停狀態
   */
  public paused: boolean;

  /**
   * 這個管家是否被摧毀
   */
  public destroyed: boolean;

  /**
   * 這個伺服器的音樂遙控器
   */
  public controller: GuildMusicController;

  /**
   * 建立單個伺服器的音樂管家
   * @param options 設定參數
   */
  constructor({ client, view, voiceChannel, textChannel, connection, autoSuppress }: GuildMusicManagerOptions) {
    this.client = client;
    this.guild = voiceChannel.guild;
    this.view = view;
    this.voiceChannel = voiceChannel;
    this.textChannel = textChannel;
    this.voiceState = voiceChannel.guild.members.me?.voice as VoiceState;

    this.autoSuppress = autoSuppress;
    this.connection = connection;
    this.player = createAudioPlayer();
    this.connection.subscribe(this.player);

    this.queue = [];
    this.nowPlaying = null;
    this.working = false;
    this.paused = false;
    this.destroyed = false;

    this.controller = new GuildMusicController({
      client: this.client, 
      channel: this.textChannel, 
      view: this.view, 
      manager: this
    });
  }

  /**
   * 待播清單的總時長，單位為秒
   */
  public get totalLength(): number {
    return this.queue.reduce((acc, cur) => acc + cur.length, 0);
  }

  /**
   * 在這個伺服器中播放歌曲
   * @param source 觸發指令的來源
   * @param keywordOrUrl 要查詢的關鍵字或歌曲的 Youtube 連結
   */
  public async play(source: Source, keywordOrUrl: string): Promise<void> {
    let resources: { stream: YouTubeStream, info: InfoData }[] | { stream: YouTubeStream, info: InfoData } | void;

    if (YoutubeUtil.isPlaylistUrl(keywordOrUrl)) {
      resources = await this.parsePlaylistUrl(source, keywordOrUrl);
    }
    else if (YoutubeUtil.isVideoUrl(keywordOrUrl)) {
      resources = await this.parseVideoUrl(source, keywordOrUrl);
    }
    else {
      resources = await this.parseKeyword(source, keywordOrUrl);
    }
    if (!resources) return;

    if (Array.isArray(resources)) {
      await this.view.bulkAddedToQueue(source, resources.length);
      const tracks = resources.map(r => new Track({ requester: source.member, ...r }));
      
      if (!this.working) {
        const firstTrack = tracks.shift() as Track;
        this._play(firstTrack);
      }

      this.queue = this.queue.concat(tracks);
      return;
    }

    const track = new Track({ requester: source.member, ...resources });

    await this.view.trackLoaded(source, track);
    if (!this.working) {
      this._play(track);
    }
    else {
      this.queue.push(track);
    }
  }

  /**
   * 切換播放器的播放／暫停狀態
   */
  public togglePlayState(): void {
    if (this.paused) this.player.unpause();
    else this.player.pause();
    this.paused = !this.paused;
  }

  /**
   * 切換播放器的重播狀態
   */
  public toggleLoopState(): void {
    this.nowPlaying?.toggleLoopState();
  }

  /**
   * 跳過正在播放的歌曲
   */
  public skip(): void {
    this.player.stop(true);
  }

  /**
   * 刪除原有的音樂遙控器，並重新發送一個
   */
  public async resend(): Promise<void> {
    if (!this.nowPlaying || !this.controller.message) {
      throw new Error('No tracks are playing now.');
    }
    await this.controller.resend();
  }

  /**
   * 抹除這個伺服器中的所有音樂記錄
   */
  public destroyAll(): void {
    this.destroyed = true;
    this.queue = [];
    this.player.stop(true);
    this.connection.destroy();
  }

  /**
   * 實際播放一首歌曲
   * @param track 歌曲
   */
  private async _play(track: Track): Promise<void> {
    if (this.voiceChannel.type === ChannelType.GuildStageVoice && this.voiceState.suppress) {
      if (!this.guild.members.me?.permissions.has(PermissionsBitField.StageModerator)) {
        await this.view.noPermOnStage(this.textChannel);
        return;
      }
      this.voiceState.setSuppressed(false);
    }
    
    this.player.play(track.resource);
    this.nowPlaying = track;
    this.working = true;
    await this.controller.resend();

    await new Promise(() => {
      this.player.once(AudioPlayerStatus.Idle, async () => {
        if (this.nowPlaying && this.nowPlaying?.loopState !== MusicLoopState.Normal) {
          await this.nowPlaying.renewResource();
          this._play(this.nowPlaying);
          if (this.nowPlaying.loopState === MusicLoopState.Again) {
            this.nowPlaying.setLoopState(MusicLoopState.Normal);
          }
          return;
        }

        const next = this.queue.shift();
        if (!next) {
          this.nowPlaying = null;
          this.working = false;

          await this.controller.clear();
          if (this.voiceChannel.type === ChannelType.GuildStageVoice && !this.voiceState.suppress && this.autoSuppress) {
            this.voiceState.setSuppressed(true);
          }
          if (!this.destroyed) {
            await this.view.endOfTheQueue(this.textChannel);
          }
          return;
        }
        this._play(next);
        await this.view.endOfTheTrack(this.textChannel, track);
      });
    });
  }

  /**
   * 解析 Youtube 播放清單
   * @param source 觸發指令的來源
   * @param url 播放清單的連結
   * @returns 播放清單中前 100 首歌曲的相關數據
   */
  private async parsePlaylistUrl(source: Source, url: string): Promise<{ stream: YouTubeStream, info: InfoData }[] | void> {
    const playlist = await ytpl.playlist_info(url, { incomplete: true }).catch(() => {});
    if (!playlist) {
      await this.view.invalidPlaylistUrl(source);
      return;
    }

    const videos = playlist.page(1).slice(0, 100) ?? [];

    const message = await this.view.startParsingPlaylist(source);
    const result: { stream: YouTubeStream, info: InfoData }[] = [];
    for (const video of videos) {
      const r = await this.fetchVideo(video.url);
      if (r) result.push(r);
    }

    if (!result.length) {
      await this.view.emptyPlaylist(message);
      return;
    }

    return result;
  }

  /**
   * 解析 Youtube 影片
   * @param source 觸發指令的來源
   * @param url 影片的連結
   * @returns 這部影片的相關資料
   */
  private async parseVideoUrl(source: Source, url: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const result = await this.fetchVideo(url).catch(console.error);
    if (!result) {
      await this.view.invalidVideoUrl(source);
      return;
    }
    return result;
  }

  /**
   * 在 Youtube 中搜尋關鍵字，並給使用者從搜尋結果中選出一首
   * @param source 觸發指令的來源
   * @param keyword 使用者給出的關鍵字
   * @returns 使用者選出的影片的相關資料
   */
  private async parseKeyword(source: Source, keyword: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const videos = await ytpl.search(keyword, { source: { youtube: 'video' }, language: 'zh' }).catch(() => {});
    if (!videos) {
      await this.view.noSearchResult(source);
      return;
    }

    const url = await this.view.selectVideo(source, videos);
    if (!url) {
      await this.view.noSearchResult(source);
      return;
    }

    const result = await this.fetchVideo(url);
    if (!result) {
      await this.view.noSearchResult(source);
      return;
    }

    return result;
  }

  /**
   * 取得一部 Youtube 影片的資料
   * @param url 影片的連結
   * @returns 這部影片的相關資料
   */
  private async fetchVideo(url: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const info = await ytpl.video_basic_info(url).catch(() => {});
    if (!info) return;

    const stream = await YoutubeUtil.getStream(url).catch(() => {}) as YouTubeStream | void;
    if (!stream) return;

    return { stream, info };
  }
}
