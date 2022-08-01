import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildMember, GuildTextBasedChannel, VoiceBasedChannel } from "discord.js";
import { HZClient } from "../../../classes/HZClient";
import { PlayMusicResultType } from "../../../utils/enums";
import { PlayMusicResult } from "../../../utils/types";
import { MusicViewRenderer } from "../View/MusicViewRenderer";
import { GuildMusicManager } from "./GuildMusicManager";
import { Track } from "./Track";

export class ClientMusicManager {
  public client: HZClient;
  public view: MusicViewRenderer;
  private guilds: Map<string, GuildMusicManager>;

  constructor(client: HZClient) {
    this.client = client;
    this.view = new MusicViewRenderer(client);
    this.guilds = new Map();
  }

  public has(guildId: string): boolean {
    return this.guilds.has(guildId);
  }

  public get(gulidId: string): GuildMusicManager | undefined {
    return this.guilds.get(gulidId);
  }

  public join(voiceChannel: VoiceBasedChannel, textChannel: GuildTextBasedChannel, autoSuppress: boolean): void {
    if (!voiceChannel.joinable) throw new Error('The voice channel is not joinable.');

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    this.guilds.set(voiceChannel.guild.id, new GuildMusicManager({
      connection: connection, 
      client: this.client, 
      view: this.view, 
      voiceChannel: voiceChannel, 
      textChannel: textChannel, 
      autoSuppress: autoSuppress
    }));

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5e3),
          entersState(connection, VoiceConnectionStatus.Connecting, 5e3),
        ]);
      } catch (error) {
        this.leave(voiceChannel.guild.id);
      }
    });
  }

  public getQueue(guildId: string): Track[] {
    const manager = this.guilds.get(guildId);
    if (!manager) throw new Error('Guild not found');
    return manager.queue;
  }

  public spliceQueue(guildId: string, start: number, length: number): void {
    const queue = this.getQueue(guildId);
    queue.splice(start, length);
  }

  public async resend(guildId: string): Promise<void> {
    const manager = this.guilds.get(guildId);
    if (!manager) throw new Error('Guild not found');
    await manager.resend();
  }

  public async play(guildId: string, requester: GuildMember, keywordOrUrl: string): Promise<PlayMusicResult> {
    const manager = this.guilds.get(guildId);
    if (!manager) return { type: PlayMusicResultType.NotInVoiceChannel };
    return await manager.play(requester, keywordOrUrl);
  }

  public leave(guildId: string): void {
    const manager = this.guilds.get(guildId);
    manager?.connection
    if (manager?.connection) {
      manager.connection.destroy();
      this.guilds.delete(guildId);
    }
  }
}