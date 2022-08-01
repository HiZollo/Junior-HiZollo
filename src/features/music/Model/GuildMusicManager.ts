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

export class GuildMusicManager {
  public client: HZClient;
  public guild: Guild;
  public view: MusicViewRenderer;
  public voiceChannel: VoiceBasedChannel;
  public textChannel: GuildTextBasedChannel;
  public voiceState: VoiceState;

  public autoSuppress: boolean;
  public connection: VoiceConnection;
  public player: AudioPlayer;
  public queue: Track[];
  public nowPlaying: Track | null;
  public working: boolean;
  public paused: boolean;

  public controller: GuildMusicController;

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

    this.controller = new GuildMusicController({
      client: this.client, 
      channel: this.textChannel, 
      view: this.view, 
      manager: this
    });
  }

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

    if (!this.working) {
      this._play(track);
      return await this.view.startPlaying(source, track);
    }

    this.queue.push(track);
    await this.view.addedToQueue(source, track);
  }

  public togglePlay(): void {
    if (this.paused) this.player.unpause();
    else this.player.pause();
    this.paused = !this.paused;
  }

  public toggleLoop(): void {
    this.nowPlaying?.toggleLoop();
  }

  public skip(): void {
    this.player.stop(true);
  }

  public async resend(): Promise<void> {
    await this.controller.resend();
  }

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
        if (this.nowPlaying?.looping) {
          await this.nowPlaying.renewResource();
          this._play(this.nowPlaying);
          return;
        }
        const next = this.queue.shift();
        if (!next) {
          await this.controller.clear();
          if (this.voiceChannel.type === ChannelType.GuildStageVoice && !this.voiceState.suppress && this.autoSuppress) {
            this.voiceState.setSuppressed(true);
          }

          this.nowPlaying = null;
          this.working = false;
          await this.view.endOfTheQueue(this.textChannel);
          return;
        }
        this._play(next);
        await this.view.endOfTheTrack(this.textChannel, track);
      });
    });
  }

  private async parsePlaylistUrl(source: Source, url: string): Promise<{ stream: YouTubeStream, info: InfoData }[] | void> {
    const playlist = await ytpl.playlist_info(url, { incomplete: true }).catch(() => {});
    if (!playlist) return await this.view.invalidPlaylistUrl(source);

    const videos = playlist.page(1).slice(0, 50);
    if (!videos) return await this.view.emptyPlaylist(source);

    const result: { stream: YouTubeStream, info: InfoData }[] = [];
    for (const video of videos) {
      const r = await this.fetchVideo(video.url);
      if (r) result.push(r);
    }

    if (!result.length) return await this.view.emptyPlaylist(source);

    return result;
  }

  private async parseVideoUrl(source: Source, url: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const result = await this.fetchVideo(url);
    if (!result) return this.view.invalidVideoUrl(source);
    return result;
  }

  private async parseKeyword(source: Source, keyword: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const videos = await ytpl.search(keyword, {
      source: {
        youtube: 'video'
      }, 
      language: 'zh'
    }).catch(() => {});

    if (!videos) return await this.view.noSearchResult(source);

    const url = await this.view.selectVideo(source, videos);
    if (!url) return await this.view.noSearchResult(source);

    const result = await this.fetchVideo(url);
    if (!result) return await this.view.noSearchResult(source);

    return result;
  }

  private async fetchVideo(url: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const info = await ytpl.video_basic_info(url).catch(() => {});
    if (!info) return;

    const stream = await ytpl.stream(url).catch(() => {}) as YouTubeStream | void;
    if (!stream) return;

    return { stream, info };
  }
}
