import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import { GuildTextBasedChannel, VoiceBasedChannel, VoiceState } from "discord.js";
import { HZClient } from "../../../classes/HZClient";
import { Source } from "../../../classes/Source";
import { MusicViewRenderer } from "../View/MusicViewRenderer";
import { GuildMusicManager } from "./GuildMusicManager";
import { Track } from "./Track";

/**
 * 掌管單個分支下的音樂系統
 */
export class ClientMusicManager {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 告知使用者音樂系統狀態的顯示器
   */
  public view: MusicViewRenderer;

  /**
   * 所有有語音連線的伺服器
   */
  private guilds: Map<string, GuildMusicManager>;

  /**
   * 建立一個單分支的音樂系統
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    this.client = client;
    this.view = new MusicViewRenderer(client);
    this.guilds = new Map();
  }

  /**
   * 查看某個伺服器有沒有建立語音連線
   * @param guildId 伺服器的 ID
   * @returns 
   */
  public has(guildId: string): boolean {
    return this.guilds.has(guildId);
  }

  /**
   * 取得某個伺服器的音樂管家
   * @param guildId 伺服器的 ID
   * @returns 
   */
  public get(gulidId: string): GuildMusicManager | undefined {
    return this.guilds.get(gulidId);
  }

  /**
   * 對所有伺服器的音樂管家進行操作
   * @param fn 操作函式
   * @returns 由函式回傳值組成的陣列
   */
  public map<T>(fn: (value: GuildMusicManager, key: string, map: Map<string, GuildMusicManager>) => T): T[] {
    const iter = this.guilds.entries();
		return Array.from({ length: this.guilds.size }, (): T => {
			const [key, value] = iter.next().value;
			return fn(value, key, this.guilds);
		});
  }

  /**
   * 在一個語音頻道中建立連線，並綁定至一個文字頻道
   * @param voiceChannel 要連線的語音頻道
   * @param textChannel 要綁定的文字頻道，所有音樂系統的訊息都會傳送到這裡
   * @param autoSuppress 是否在閒置時自動退下舞台（僅舞台頻道中有作用）
   */
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

  /**
   * 取得某個伺服器正在播放的歌曲
   * @param guildId 伺服器的 ID
   * @returns 正在播放的歌曲
   */
  public getNowPlaying(guildId: string): Track | null {
    const manager = this.guilds.get(guildId);
    if (!manager) throw new Error('Guild not found');
    return manager.nowPlaying;
  }

  /**
   * 取得某個伺服器待播清單的總時長，不包含正在播放的歌曲
   * @param guildId 伺服器的 ID
   * @returns 總時長，單位為秒
   */
  public getTotalLength(guildId: string): number {
    const manager = this.guilds.get(guildId);
    if (!manager) throw new Error('Guild not found');
    return manager.totalLength;
  }

  /**
   * 取得某個伺服器的待播清單，不包含正在播放的歌曲
   * @param guildId 伺服器的 ID
   * @returns 待播清單
   */
  public getQueue(guildId: string): Track[] {
    const manager = this.guilds.get(guildId);
    if (!manager) throw new Error('Guild not found');
    return manager.queue;
  }

  /**
   * 移除某個伺服器的待播清單中一部分的連續歌曲
   * @param guildId 伺服器的 ID
   * @param start 起始駐標
   * @param length 連續歌曲的數量
   */
  public spliceQueue(guildId: string, start: number, length: number): void {
    const queue = this.getQueue(guildId);
    queue.splice(start, length);
  }

  /**
   * 重新發送某個伺服器的音樂遙控器
   * @param guildId 伺服器的 ID
   */
  public async resend(guildId: string): Promise<void> {
    const manager = this.guilds.get(guildId);
    if (!manager) throw new Error('Guild not found');
    await manager.resend();
  }

  /**
   * 在某個伺服器中播放歌曲
   * @param source 觸發指令的來源
   * @param keywordOrUrl 要查詢的關鍵字或歌曲的 Youtube 連結
   */
  public async play(source: Source, keywordOrUrl: string): Promise<void> {
    const manager = this.guilds.get(source.guild.id);
    if (!manager) throw new Error('Guild not found');
    return await manager.play(source, keywordOrUrl);
  }

  /**
   * 中斷與某個伺服器之間的語音連結
   * @param guildId 伺服器的 ID
   */
  public leave(guildId: string): void {
    const manager = this.guilds.get(guildId);
    if (manager?.connection) {
      manager.player.stop(true);
      manager.connection.destroy();
      this.guilds.delete(guildId);
    }
  }

  /**
   * 當成員的語音狀態更新時需要處理的動作，目前只有判斷頻道是否只剩機器人，如果為真，則離開語音頻道
   * @param oldState 舊的語音狀態
   * @param newState 新的語音狀態
   */
  public onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): void {
    if (!this.has(oldState.guild.id)) return;

    // 只留下離開音樂頻道（oldId -> null），或是切換音樂頻道（oldId -> newId）
    if (!oldState.channelId || oldState.channelId === newState.channelId) return;

    const manager = this.get(oldState.guild.id)!;
    if (manager.voiceChannel.members.some(m => !m.user.bot)) return;
    this.leave(oldState.guild.id);
    this.view.noHumanInVoice(manager.textChannel);
    manager.controller.clear();
  }
}