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

import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ComponentType, GuildMember, GuildTextBasedChannel, InteractionCollector, Message, MessageOptions } from "discord.js";
import { HZClient } from "../../HZClient";
import { MusicControllerActions, MusicLoopState } from "../../../utils/enums";
import { GuildMusicControllerOptions } from "../../../utils/interfaces";
import { GuildMusicManager } from "../Model/GuildMusicManager";
import { MusicViewRenderer } from "../View/MusicViewRenderer";

/**
 * 代表單個伺服器的音樂遙控器
 */
export class GuildMusicController {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 與這個音樂遙控器綁定的文字頻道
   */
  public channel: GuildTextBasedChannel;

  /**
   * 告知使用者音樂系統狀態的顯示器
   */
  public view: MusicViewRenderer;

  /**
   * 所屬伺服器的音樂管家
   */
  public manager: GuildMusicManager;

  /**
   * 被遙控器附著的訊息
   */
  public message: Message | null;

  /**
   * 負責接收按鈕互動的收集器
   */
  public collector: InteractionCollector<ButtonInteraction> | null;

  /**
   * 遙控器上負責控制音樂系統的按鈕
   */
  private controllerButtons: ButtonBuilder[];

  /**
   * 遙控器上負責顯示資訊的按鈕
   */
  private dataButtons: ButtonBuilder[];

  /**
   * 建立一台音樂遙控器
   * @param options 設定參數
   */
  constructor({ client, channel, view, manager }: GuildMusicControllerOptions) {
    this.client = client;
    this.channel = channel;
    this.view = view;
    this.manager = manager;
    this.message = null;
    this.collector = null;

    this.controllerButtons = [
      this.getPlayButton(0), 
      this.getRepeatButton(0), 
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

  /**
   * 將遙控器原本附著的訊息刪除，並重新附著在一則新發送的訊息
   */
  public async resend(): Promise<void> {
    await this.message?.delete().catch(() => {});
    this.message = await this.channel.send(this.newMessage);
    this.collector = this.newCollector;
  }

  /**
   * 清除遙控器附著的訊息以及收集器
   */
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
      embeds: this.view.getcontrollerEmbeds(this.manager)
    }
  }

  /**
   * 取得新的遙控器按鈕
   */
  private get newComponents(): ActionRowBuilder<ButtonBuilder>[] {
    this.controllerButtons[0] = this.getPlayButton(+this.manager.paused);
    this.controllerButtons[1] = this.getRepeatButton(this.manager.nowPlaying!.loopState);
    
    return [
      new ActionRowBuilder<ButtonBuilder>().addComponents(...this.controllerButtons), 
      new ActionRowBuilder<ButtonBuilder>().addComponents(...this.dataButtons), 
    ];
  }

  /**
   * 在遙控器附著的訊息上建立新的收集器
   */
  private get newCollector(): InteractionCollector<ButtonInteraction> {
    if (!this.message) throw new Error('Message does not exist.');
    this.collector?.removeAllListeners('collected');

    const collector = this.message.createMessageComponentCollector({
      componentType: ComponentType.Button, 
      filter: async interaction => {
        if (!interaction.customId.startsWith('music_ctrl')) return false;
        if (!(interaction.member instanceof GuildMember)) return false;

        if (interaction.member.voice.channelId !== this.manager.voiceChannel.id && interaction.customId !== 'music_ctrl_info') {
          await this.view.controllerError(interaction);
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
      switch (args[2]) {
        case 'play':
          this.manager.togglePlayState();
          this.controllerButtons[0] = this.getPlayButton(+this.manager.paused);
          await this.view.controllerAction(
            this.manager.paused ? MusicControllerActions.Pause : MusicControllerActions.Resume, 
            interaction, nowPlaying
          );
          break;
        
        case 'repeat':
          this.manager.toggleLoopState();
          this.controllerButtons[1] = this.getRepeatButton(this.manager.nowPlaying!.loopState);
          await this.view.controllerAction(
            this.manager.nowPlaying!.loopState === MusicLoopState.Normal ? MusicControllerActions.NoRepeat :
            this.manager.nowPlaying!.loopState === MusicLoopState.Again ? MusicControllerActions.Again :
            MusicControllerActions.Repeat, 
            interaction, nowPlaying
          );
          break;
        
        case 'skip':
          this.manager.skip();
          await this.view.controllerAction(MusicControllerActions.Skip, interaction, nowPlaying);
          return; // 跳過後附著訊息會被刪除，所以沒有 reply 也沒關係
        
        case 'info':
          await this.view.controllerAction(MusicControllerActions.Info, interaction, nowPlaying);
          return; // 這邊 render 的時候會 reply，所以直接結束
      }

      await interaction.update({ components: this.newComponents });
    });

    return collector;
  }

  private playButton = new ButtonBuilder()
    .setCustomId('music_ctrl_play')
    .setStyle(ButtonStyle.Primary);
  private repeatButton = new ButtonBuilder()
    .setCustomId('music_ctrl_repeat')
    .setStyle(ButtonStyle.Secondary);
  
  /**
   * 取得播放狀態的按鈕
   */
  private getPlayButton(index: number): ButtonBuilder {
    return this.playButton.setEmoji(this.emojis.play[index]);
  }

  /**
   * 取得重播狀態的按鈕
   */
  private getRepeatButton(index: number): ButtonBuilder {
    return this.repeatButton.setEmoji(this.emojis.repeat[index]);
  }

  /**
   * 遙控器按鈕上的表情符號
   */
  private emojis = Object.freeze({
    play: ['1002969357980270642', '880450475202314300'], 
    repeat: ['➡️', '🔂', '🔁'], 
    skip: '880450475156176906', 
    info: '🎵'
  });
}