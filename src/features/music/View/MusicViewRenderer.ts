import { EmbedBuilder, GuildTextBasedChannel } from "discord.js";
import { ButtonInteraction } from "discord.js";
import { YouTubeVideo } from "play-dl";
import { HZClient } from "../../../classes/HZClient";
import { Source } from "../../../classes/Source";
import { MusicControllerActions, PageSystemMode } from "../../../utils/enums";
import { PageSystemPagesOptions } from "../../../utils/interfaces";
import fixedDigits from "../../utils/fixedDigits";
import pageSystem from "../../utils/pageSystem";
import tempMessage from "../../utils/tempMessage";
import { GuildMusicManager } from "../Model/GuildMusicManager";
import { Track } from "../Model/Track";

export class MusicViewRenderer {
  public client: HZClient;

  constructor(client: HZClient) {
    this.client = client;
  }

  public async invalidVideoUrl(source: Source): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('我找不到這個影片連結的相關資訊，可能是因為它是私人影片，或是影片有年齡限制，或單純只是你亂打連結');
    await source.update({ embeds: [embed] });
  }

  public async invalidPlaylistUrl(source: Source): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('我找不到這個播放清單連結的相關資訊，可能是因為這個清單是私人的，或單純只是你亂打連結');
    await source.update({ embeds: [embed] });
  }

  public async noSearchResult(source: Source): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('我找不到任何與你的關鍵字相關的影片，請試試看其他關鍵字');
    await source.update({ embeds: [embed] });
  }

  public async startPlaying(source: Source, track: Track): Promise<void> {
    const embed = this.baseEmbed
      .setDescription(`${track.videoLink} 載入成功，即將開始播放`);
    await source.update({ embeds: [embed] });
  }

  public async addedToQueue(source: Source, track: Track): Promise<void> {
    const embed = this.baseEmbed
      .setDescription(`${track.videoLink} 歌曲載入成功，已加入待播清單中`);
    await source.update({ embeds: [embed] });
  }


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


  public async noPermOnStage(channel: GuildTextBasedChannel): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('我沒有辦法在這舞台頻道上發言！請你給我發言權或是讓我成為舞台版主');
    tempMessage(channel, { embeds: [embed] }, 5);
  }

  public async endOfTheTrack(channel: GuildTextBasedChannel, track: Track): Promise<void> {
    const embed = this.baseEmbed
      .setDescription(`${track.videoLink} 已播放完畢`);
    tempMessage(channel, { embeds: [embed] }, 5);
  }

  public async endOfTheQueue(channel: GuildTextBasedChannel): Promise<void> {
    const embed = this.baseEmbed
      .setDescription('清單上的歌曲已全數播放完畢');
    tempMessage(channel, { embeds: [embed] }, 5);
  }

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

  public async controllerError(interaction: ButtonInteraction): Promise<void> {
    await interaction.reply({ content: '你必須在語音頻道內才能操控這個按鈕', ephemeral: true });
  }

  public get baseEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的音樂中心', iconURL: this.client.user?.displayAvatarURL() })
      .setHiZolloColor();
  }

  public getcontrollerEmbeds(manager: GuildMusicManager): EmbedBuilder[] {
    return [
      this.baseEmbed
        .setDescription(`目前正在播放：${manager.nowPlaying?.videoLink}`)
        .setThumbnail(manager.nowPlaying?.thumbnailUrl ?? null)
        .setFooter({ text: `由 ${manager.nowPlaying?.requester.displayName} 指定的歌曲`, iconURL: manager.nowPlaying?.requester.displayAvatarURL() })
    ];
  }

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