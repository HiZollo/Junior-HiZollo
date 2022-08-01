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
    let resource: { stream: YouTubeStream, info: InfoData } | void;

    if (YoutubeUtil.isVideoUrl(keywordOrUrl)) {
      resource = await this.parseVideoUrl(keywordOrUrl);
      if (!resource) {
        return await this.view.invalidVideoUrl(source);
      }
    }

    else if (YoutubeUtil.isPlaylistUrl(keywordOrUrl)) {
      resource = await this.parsePlaylistUrl(keywordOrUrl);
      if (!resource) {
        return await this.view.invalidPlaylistUrl(source);
      }
    }
    else {
      resource = await this.parseKeyword(keywordOrUrl);
      if (!resource) {
        return await this.view.noSearchResult(source);
      }
    }

    const track = new Track({ requester: source.member, ...resource });

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

  private async parseVideoUrl(url: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    const info = await ytpl.video_basic_info(url).catch(() => {});
    if (!info) return;

    const stream = await ytpl.stream(url).catch(() => {}) as YouTubeStream | void;
    if (!stream) return;

    return { stream, info };
  }

  private async parsePlaylistUrl(url: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    console.log(url);
  }

  private async parseKeyword(keyword: string): Promise<{ stream: YouTubeStream, info: InfoData } | void> {
    console.log(keyword);
  }
}
