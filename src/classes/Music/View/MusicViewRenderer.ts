import { EmbedBuilder, GuildTextBasedChannel, Message } from "discord.js";
import { ButtonInteraction } from "discord.js";
import { YouTubeVideo } from "play-dl";
import { HZClient } from "../../../classes/HZClient";
import { Source } from "../../../classes/Source";
import { MusicControllerActions, PageSystemMode } from "../../../utils/enums";
import { PageSystemPagesOptions } from "../../../utils/interfaces";
import fixedDigits from "../../../features/utils/fixedDigits";
import pageSystem from "../../../features/utils/pageSystem";
import tempMessage from "../../../features/utils/tempMessage";
import { GuildMusicManager } from "../Model/GuildMusicManager";
import { Track } from "../Model/Track";

/**
 * 告知使用者音樂系統狀態的顯示器
 */
export class MusicViewRenderer {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 建立一個顯示器
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    this.client = client;
  }

  /**
   * 告知使用者這是無效的播放清單
   * @param source 觸發指令的來源
   * @returns 顯示此資訊的訊息
   */
  public async invalidPlaylistUrl(source: Source): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription('我找不到這個播放清單連結的相關資訊，可能是因為這個清單是私人的，或單純只是你亂打連結');
    return await source.update({ embeds: [embed] });
  }

  /**
   * 告知使用者這個播放清單是空的
   * @param source 觸發指令的來源
   * @returns 顯示此資訊的訊息
   */
  public async emptyPlaylist(message: Message): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription('這個播放清單似乎是空的，我在裡面找不到任何影片');
    return await message.edit({ embeds: [embed] });
  }

  /**
   * 告知使用者找不到這部影片
   * @param source 觸發指令的來源
   * @returns 顯示此資訊的訊息
   */
  public async invalidVideoUrl(source: Source): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription('我找不到這個影片連結的相關資訊，可能是因為它是私人影片，或是影片有年齡限制，或單純只是你亂打連結');
    return await source.update({ embeds: [embed] });
  }

  /**
   * 告知使用者找不到任何搜尋結果
   * @param source 觸發指令的來源
   * @returns 顯示此資訊的訊息
   */
  public async noSearchResult(source: Source): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription('我找不到任何與你的關鍵字相關的影片，請試試看其他關鍵字');
    return await source.update({ embeds: [embed] });
  }

  /**
   * 告知使用者開始讀取播放清單
   * @param source 觸發指令的來源
   * @returns 顯示此資訊的訊息
   */
  public async startParsingPlaylist(source: Source): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription('已開始讀取播放清單，如果播放清單太長，可能需要等待個幾分鐘');
    return await source.update({ embeds: [embed] });
  }

  /**
   * 告知使用者一部影片已載入成功
   * @param source 觸發指令的來源
   * @param track 載入成功的歌曲
   * @returns 顯示此資訊的訊息
   */
  public async startPlaying(source: Source, track: Track): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription(`${track.videoLink} 載入成功，即將開始播放`);
    return await source.update({ embeds: [embed] });
  }

  /**
   * 告知使用者一首歌曲已被加進待播清單中
   * @param source 觸發指令的來源
   * @param track 被加入的歌曲
   * @returns 顯示此資訊的訊息
   */
  public async addedToQueue(source: Source, track: Track): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription(`${track.videoLink} 歌曲載入成功，已加入待播清單中`);
    return await source.update({ embeds: [embed] });
  }

  /**
   * 告知使用者多首歌曲已被加進待播清單中
   * @param source 觸發指令的來源
   * @param trackCount 歌曲的數量
   * @returns 顯示此資訊的訊息
   */
  public async bulkAddedToQueue(source: Source, trackCount: number): Promise<Message> {
    const embed = this.baseEmbed
      .setDescription(`已將播放清單中的 ${trackCount} 首歌曲加入待播清單中`);
    return await source.update({ embeds: [embed] });
  }

  /**
   * 讓使用者從多首歌曲中選出一首
   * @param source 觸發指令的來源
   * @param videos 可供選擇的歌曲
   * @returns 選中歌曲的連結
   */
  public async selectVideo(source: Source, videos: YouTubeVideo[]): Promise<string | void> {
    // 只有單頁，最多十筆資料
    const pages: PageSystemPagesOptions[][] = [[]];
    for (let i = 0; i < Math.min(videos.length, 10); i++) {
      pages[0].push({
        name: videos[i].title ?? '[無法取得標題內容]', 
        url: videos[i].url
      });
    }

    const result = await pageSystem({
      mode: PageSystemMode.Description, 
      source: source, 
      embed: this.baseEmbed, 
      description: '以下是搜尋結果，請選擇一首你想播放的歌曲', 
      pages: pages, 
      allowSelect: true, 
      contents: {
        exit: '已結束搜尋', 
        idle: '搜尋清單已因閒置過久而關閉'
      }
    });

    return result?.url;
  }

  /**
   * 告知使用者機器人無法在舞台頻道中播放音訊
   * @param channel 要傳送的目標頻道
   */
  public async noPermOnStage(channel: GuildTextBasedChannel): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('我沒有辦法在這舞台頻道上發言！請你給我發言權或是讓我成為舞台版主');
    tempMessage(channel, { embeds: [embed] }, 5);
  }

  /**
   * 告知使用者一首歌曲已播放完畢
   * @param channel 要傳送的目標頻道
   * @param track 播放完畢的歌曲
   */
  public async endOfTheTrack(channel: GuildTextBasedChannel, track: Track): Promise<void> {
    const embed = this.baseEmbed
      .setDescription(`${track.videoLink} 已播放完畢`);
    tempMessage(channel, { embeds: [embed] }, 5);
  }

  /**
   * 告知使用者所有歌曲皆已播放完畢
   * @param channel 要傳送的目標頻道
   */
  public async endOfTheQueue(channel: GuildTextBasedChannel): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('清單上的歌曲已全數播放完畢');
    tempMessage(channel, { embeds: [embed] }, 5);
  }

  /**
   * 使用者按下遙控器按鈕後的回饋訊息
   * @param action 使用者的動作
   * @param interaction 按鈕互動
   * @param nowPlaying 正在播放的歌曲
   */
  public async controllerAction(action: MusicControllerActions, interaction: ButtonInteraction, nowPlaying: Track): Promise<void> {
    let description: string;
    switch (action) {
      case MusicControllerActions.Pause:
        description = `${interaction.member}，已暫停播放`;
        break;
      case MusicControllerActions.Resume:
        description = `${interaction.member}，已繼續播放`;
        break;
      case MusicControllerActions.Repeat:
        description = `${interaction.member}，已將重複狀態設為循環播放`;
        break;
      case MusicControllerActions.NoRepeat:
        description = `${interaction.member}，已將重複狀態設為正常播放`;
        break;
      case MusicControllerActions.Skip:
        description = `${interaction.member}，已跳過當前歌曲`;
        break;
      
      case MusicControllerActions.Info:
        const embed = this.baseEmbed
          .setDescription(this.getTrackDescription(nowPlaying))
          .setThumbnail(nowPlaying?.thumbnailUrl ?? null)
          .setFooter({
            text: `由 ${nowPlaying.requester.displayName} 指定的歌曲｜${nowPlaying.looping ? '🔁 循環播放中' : '➡️ 無重複播放'}`,
            iconURL: nowPlaying.requester.displayAvatarURL()
          });
          await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    const embed = this.baseEmbed
      .setDescription(description)
      .setThumbnail(nowPlaying?.thumbnailUrl ?? null);
    if (interaction.channel) {
      await tempMessage(interaction.channel, { embeds: [embed] }, 5);
    }
  }

  /**
   * 告知使用者需要進入語音頻道才能控制此按鈕
   * @param interaction 按鈕互動
   */
  public async controllerError(interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '你必須在語音頻道內才能操控這個按鈕', ephemeral: true });
  }

  /**
   * 取得基本的嵌入物件
   */
  public get baseEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的音樂中心', iconURL: this.client.user?.displayAvatarURL() })
      .setHiZolloColor();
  }

  /**
   * 取得控制器的嵌入物件
   */
  public getcontrollerEmbeds(manager: GuildMusicManager): EmbedBuilder[] {
    return [
      this.baseEmbed
        .setDescription(`目前正在播放：${manager.nowPlaying?.videoLink}`)
        .setThumbnail(manager.nowPlaying?.thumbnailUrl ?? null)
        .setFooter({ text: `由 ${manager.nowPlaying?.requester.displayName} 指定的歌曲`, iconURL: manager.nowPlaying?.requester.displayAvatarURL() })
    ];
  }

  /**
   * 取得一首歌曲的相關資訊
   */
  public getTrackDescription(track: Track): string {
    return !track ? '' : `
目前正在播放：${track.videoLink}

播放時間：${this.msFormat(track.resource.playbackDuration)}／${this.msFormat(track.length * 1000)}

上傳頻道：${track.channelLink}

上傳日期：${track.uploadedAt}

觀看次數：${this.viewsFormat(track.views)}
\u200b
`;
  }

  public msFormat(time: number): string {
    time = Math.round(time / 1000);
    const [h, m, s] = [~~(time / 3600), ~~(time % 3600 / 60), time % 60];
    return `${h ? `${h}:${fixedDigits(m, 2)}` : `${m}`}:${fixedDigits(s, 2)}`;
  }

  public viewsFormat(views: number) {
    const bases = [10000, 10000, 10000];
    const baseNames = ['', '萬', '億', '兆'];

    let index = 0;
    while (bases[index] < views && index < 3) {
      views = views / bases[index];
      index++;
    }

    return `${views < 10 ? views.toFixed(1) : ~~views} ${baseNames[index]}次`
  }
}