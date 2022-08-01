import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, GuildTextBasedChannel, InteractionCollector, Message, MessageOptions } from "discord.js";
import { HZClient } from "../../../classes/HZClient";
import { GuildMusicControllerOptions } from "../../../utils/interfaces";
import fixedDigits from "../../utils/fixedDigits";
import tempMessage from "../../utils/tempMessage";
import { GuildMusicManager } from "../Model/GuildMusicManager";
import { Track } from "../Model/Track";

export class GuildMusicController {
  public client: HZClient;
  public channel: GuildTextBasedChannel;
  public manager: GuildMusicManager;
  public message: Message | null;
  public collector: InteractionCollector<ButtonInteraction> | null;

  public playButtonsItr: Iterator<ButtonBuilder, ButtonBuilder>;
  public repeatButtonsItr: Iterator<ButtonBuilder, ButtonBuilder>;

  private controllerButtons: ButtonBuilder[];
  private dataButtons: ButtonBuilder[];

  constructor({ client, channel, manager }: GuildMusicControllerOptions) {
    this.client = client;
    this.channel = channel;
    this.manager = manager;
    this.message = null;
    this.collector = null;

    this.playButtonsItr = this.playButtons();
    this.repeatButtonsItr = this.repeatButtons();

    this.controllerButtons = [
      this.playButtonsItr.next().value, 
      this.repeatButtonsItr.next().value, 
      new ButtonBuilder()
        .setCustomId('music_ctrl_skip')
        .setStyle(ButtonStyle.Danger)
        .setEmoji(this.emojis.skip), 
    ];
    this.dataButtons = [
      new ButtonBuilder()
      .setCustomId('music_ctrl_info')
      .setStyle(ButtonStyle.Success)
      .setEmoji(this.emojis.info)
    ];
  }

  public async resend(): Promise<void> {
    await this.message?.delete().catch(() => {});
    this.message = await this.channel.send(this.newMessage);
    this.collector = this.newCollector;
  }

  public async clear(): Promise<void> {
    await this.message?.delete().catch(() => {});
    this.collector?.removeAllListeners('collected');
    this.collector = null;
  }

  /**
   * 回傳現正播放歌曲的 MessageOptions
   */
  private get newMessage(): MessageOptions {
    return {
      components: this.newComponents, 
      embeds: this.newEmbeds
    }
  }

  private get newComponents(): ActionRowBuilder<ButtonBuilder>[] {
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(...this.controllerButtons), 
      new ActionRowBuilder<ButtonBuilder>().addComponents(...this.dataButtons), 
    ];
  }

  private get newEmbeds(): EmbedBuilder[] {
    return [
      new EmbedBuilder()
        .setAuthor({ name: 'HiZollo 的音樂中心', iconURL: this.client.user?.displayAvatarURL() })
        .setDescription(`目前正在播放：${this.manager.nowPlaying?.videoLink}`)
        .setThumbnail(this.manager.nowPlaying?.thumbnailUrl ?? null)
        .setFooter({ text: `由 ${this.manager.nowPlaying?.requester.displayName} 指定的歌曲`, iconURL: this.manager.nowPlaying?.requester.displayAvatarURL() })
        .setHiZolloColor()
    ];
  }

  private get newCollector(): InteractionCollector<ButtonInteraction> {
    if (!this.message) throw new Error('Message does not exist.');
    this.collector?.removeAllListeners('collected');

    const collector = this.message.createMessageComponentCollector({
      componentType: ComponentType.Button, 
      filter: async interaction => {
        if (!interaction.customId.startsWith('music_ctrl')) return false;
        if (!(interaction.member instanceof GuildMember)) return false;

        if (interaction.member.voice.channelId !== this.manager.voiceChannel.id && interaction.customId !== 'music_ctrl_info') {
          await interaction.followUp({ content: '你必須在語音頻道內才能操控這個按鈕', ephemeral: true });
          return false;
        }
        return true;
      }
    });

    collector.on('collect', async interaction => {
      if (!(interaction.member instanceof GuildMember)) return;

      const nowPlaying = this.manager.nowPlaying;
      if (!nowPlaying) return;

      const args = interaction.customId.split('_');
      const embed = new EmbedBuilder()
        .setAuthor({ name: 'HiZollo 的音樂中心', iconURL: interaction.client.user?.displayAvatarURL() })
        .setHiZolloColor()
        .setThumbnail(nowPlaying.thumbnailUrl);
      
      switch (args[2]) {
        case 'play':
          this.controllerButtons[0] = this.playButtonsItr.next().value;
          this.manager.togglePlay();
          embed.setDescription(this.controllerButtons[0].data.emoji?.id === this.emojis.play[0] ? `${interaction.member}，已繼續播放` : `${interaction.member}，已暫停播放`)
          break;
        
        case 'repeat':
          this.controllerButtons[1] = this.repeatButtonsItr.next().value;
          this.manager.toggleLoop();
          embed.setDescription(`${interaction.member}，已將重複狀態設為` + (this.controllerButtons[1].data.emoji?.name === this.emojis.repeat[0] ? '正常播放' : '單曲循環'));
          break;
        
        case 'skip':
          this.manager.skip();
          embed.setDescription(`${interaction.member}，已跳過當前歌曲`);
          break;
        
        case 'info':
          embed.setDescription(this.getDescription(nowPlaying))
            .setFooter({
              text: `由 ${nowPlaying.requester.displayName} 指定的歌曲｜${nowPlaying.looping ? '🔁 循環播放中' : '➡️ 無重複播放'}`,
              iconURL: nowPlaying.requester.displayAvatarURL()
            });
          await interaction.reply({ embeds: [embed], ephemeral: true });
          return; // 這邊傳完 ephemeral message 就結束了
      }

      await interaction.update({ components: this.newComponents });
      if (interaction.channel) {
        await tempMessage(interaction.channel, { embeds: [embed] }, 5);
      }
    });

    return collector;
  }

  private *playButtons(): Generator<ButtonBuilder, ButtonBuilder, void> {
    let index = 0;
    const button = new ButtonBuilder()
      .setCustomId('music_ctrl_play')
      .setStyle(ButtonStyle.Primary);
    while (true) {
      yield button.setEmoji(this.emojis.play[(index++) % 2]);
    }
  }

  private *repeatButtons(): Generator<ButtonBuilder, ButtonBuilder, void> {
    let index = 0;
    const button = new ButtonBuilder()
      .setCustomId('music_ctrl_repeat')
      .setStyle(ButtonStyle.Secondary);
    while (true) {
      yield button.setEmoji(this.emojis.repeat[(index++) % 2]);
    }
  }

  private emojis = Object.freeze({
    play: ['1002969357980270642', '880450475202314300'], 
    repeat: ['➡️', '🔂'], 
    skip: '880450475156176906', 
    info: '🎵'
  });

  private getDescription(track: Track): string {
    return `
目前正在播放：${track.videoLink}

播放時間：${this.msFormat(track.resource.playbackDuration)}／${this.msFormat(track.length * 1000)}

上傳頻道：${track.channelLink}

上傳日期：${track.uploadedAt}

觀看次數：${this.viewsFormat(track.views)}
\u200b
`;
  }

  private msFormat(time: number): string {
    time = Math.round(time / 1000);
    const [h, m, s] = [~~(time / 3600), ~~(time % 3600 / 60), time % 60];
    return `${h ? `${h}:${fixedDigits(m, 2)}` : `${m}`}:${fixedDigits(s, 2)}`;
  }

  private viewsFormat(views: number) {
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