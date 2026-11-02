import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { Player, Tofe, TofeDirections } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsInputResult, DjsTofeOptions, TofeStrings } from '../../typings/game';

export class DjsTofe extends DjsGameWrapper {
  public strings: TofeStrings;

  protected game: Tofe;
  protected inputMode: number;
  protected boardButtons: ButtonBuilder[][];

  
  constructor({ players, hardMode, source, time }: DjsTofeOptions) {
    super({ source, time });
    this.game = new Tofe({ players, hardMode });

    this.strings = gameString.tofe;

    this.inputMode = 0b10;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);
    
    this.boardButtons = [];
  }

  async initialize(): Promise<void> {
    await super.initialize(
      { content: format(this.strings.score, { score: this.game.score }), components: [] }, 
      { content: '\u200b', components: this.newController }
    );

    for (let i = 0; i < this.game.boardSize; i++) {
      this.boardButtons.push([]);
      for (let j = 0; j < this.game.boardSize; j++) {
        this.boardButtons[i][j] = new ButtonBuilder()
          .setCustomId(`HZG_PLAY_${i}_${j}`)
          .setLabel(`${this.game.board[i][j] ?? '\u200b'}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true);
      }
    }

    await this.mainMessage?.edit({ components: this.displayBoard });
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "WIN":
        return format(message.win, { player: `<@${this.winner?.id}>` });
      case "LOSE":
        return format(message.lose, { player: `<@${this.loser?.id}>` });
      case "IDLE":
        return message.idle;
      case "STOPPED":
        return message.stopped;
      case "DELETED":
        return message.deleted;
      default:
        return '';
    }
  }


  protected buttonFilter(i: ButtonInteraction): boolean {
    return i.customId.startsWith("HZG_PLAY") && i.user.id === this.game.playerManager.nowPlayer.id;
  }

  protected messageFilter(): boolean {
    return false;
  }

  protected idleToDo(nowPlayer: Player): DjsInputResult {
    nowPlayer.status.set("IDLE");
    return {};
  }

  protected playToDo(nowPlayer: Player, input: string): DjsInputResult {
    const args = input.split('_');
    let endStatus = "";
    let success = false;
    
    switch (args[2]) {
      case 'up':
        success = this.game.operate(TofeDirections.Up);
        break;
      case 'down':
        success = this.game.operate(TofeDirections.Down);
        break;
      case 'left':
        success = this.game.operate(TofeDirections.Left);
        break;
      case 'right':
        success = this.game.operate(TofeDirections.Right);
        break;
    }

    nowPlayer.status.set("PLAYING");
    if (success) {
      nowPlayer.addStep();
    }
    if (this.game.win()) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }
    else if (this.game.lose()) {
      this.loser = nowPlayer;
      endStatus = "LOSE";
    }

    return {
      content: format(this.strings.score, { score: this.game.score }), 
      components: this.displayBoard, 
      endStatus: endStatus
    };
  }

  protected async botMove(): Promise<DjsInputResult> {
    throw new Error("Bots are not allowed in this game.");
  }

  protected async update(result: DjsInputResult): Promise<DjsInputResult> {
    if (!this.mainMessage) {
      throw new Error("The main message of the game is invalid.");
    }

    this.game.playerManager.next();
    await this.mainMessage.edit(result).catch(() => {
      result.endStatus = "DELETED";
    });
    return result;
  }

  protected async end(status: string): Promise<void> {
    this.game.end(status);

    await this.subMessage?.delete().catch(() => {});
  }


  private get newController(): ActionRowBuilder<ButtonBuilder>[] {
    return [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_PLAY_empty_1')
        .setLabel('\u200b')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true), 
      new ButtonBuilder()
        .setCustomId('HZG_PLAY_up')
        .setLabel(this.strings.controller.up)
        .setStyle(ButtonStyle.Primary), 
      new ButtonBuilder()
        .setCustomId('HZG_PLAY_empty_2')
        .setLabel('\u200b')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true), 
    ), new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_PLAY_left')
        .setLabel(this.strings.controller.left)
        .setStyle(ButtonStyle.Primary), 
      new ButtonBuilder()
        .setCustomId('HZG_PLAY_down')
        .setLabel(this.strings.controller.down)
        .setStyle(ButtonStyle.Primary), 
      new ButtonBuilder()
        .setCustomId('HZG_PLAY_right')
        .setLabel(this.strings.controller.right)
        .setStyle(ButtonStyle.Primary), 
    ), new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_leave')
        .setLabel(this.strings.controller.leave)
        .setStyle(ButtonStyle.Danger)
    )]
  }

  private get displayBoard(): ActionRowBuilder<ButtonBuilder>[] {
    let result = [];
    for (let i = 0; i < this.game.boardSize; i++) {
      result.push(new ActionRowBuilder<ButtonBuilder>());
      for (let j = 0; j < this.game.boardSize; j++) {
        this.boardButtons[i][j]
          .setLabel(`${this.game.board[i][j] ?? '\u200b'}`)
          .setStyle(this.game.board[i][j] === this.game.goal ? ButtonStyle.Success : ButtonStyle.Primary);
        result[i].addComponents(this.boardButtons[i][j]);
      }
    }
    return result;
  }
}