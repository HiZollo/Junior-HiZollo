import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { LightsUp, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsInputResult, DjsLightsUpOptions, LightsUpStrings } from '../../typings/game';

export class DjsLightsUp extends DjsGameWrapper {
  public answered: boolean;

  public strings: LightsUpStrings;

  protected game: LightsUp;
  protected inputMode: number;
  protected boardButtons: ButtonBuilder[][];


  constructor({ players, boardSize = 5, source, time }: DjsLightsUpOptions) {
    super({ source, time });
    if (!(1 <= boardSize && boardSize <= 5)) {
      throw new Error("Parameter boardSize has to be in [1, 5].");
    }
    this.game = new LightsUp({ players, boardSize });

    this.strings = gameString.lightsUp;

    this.inputMode = 0b10;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);

    this.answered = false;
    this.boardButtons = [];
  }

  async initialize(): Promise<void> {
    const subComponents = [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_answer')
        .setLabel(this.strings.controller.answer)
        .setStyle(ButtonStyle.Success), 
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_leave')
        .setLabel(this.strings.controller.leave)
        .setStyle(ButtonStyle.Danger)
    )]
    
    await super.initialize(
      { content: '\u200b', components: [] }, 
      { content: '\u200b', components: subComponents }
    );

    for (let i = 0; i < this.game.boardSize; i++) {
      this.boardButtons.push([]);
      for (let j = 0; j < this.game.boardSize; j++) {
        this.boardButtons[i].push(new ButtonBuilder()
          .setCustomId(`HZG_PLAY_${i}_${j}`)
          .setLabel('\u200b')
          .setStyle(this.game.board[i][j] ? ButtonStyle.Primary : ButtonStyle.Secondary)
        );
      }
    }

    if (this.game.win()) {
      this.end("JACKPOT");
    }

    await this.mainMessage?.edit({ components: this.displayBoard });
  }

  flip(row: number, col: number): void {
    this.game.flip(row, col);

    [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
      const nr = row + dr, nc = col + dc;
      if (0 <= nr && nr < this.game.boardSize && 0 <= nc && nc < this.game.boardSize) {
        this.boardButtons[nr][nc].setStyle(this.game.board[nr][nc] ? ButtonStyle.Primary : ButtonStyle.Secondary);
      }
    });
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "JACKPOT":
        return format(message.jackpot, { player: `<@${this.winner?.id}>` });
      case "WIN":
        return format(this.answered ? message.win : message.unansweredWin, { player: `<@${this.winner?.id}>` });
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

  protected async ctrlCollected(interaction: ButtonInteraction): Promise<void> {
    super.ctrlCollected(interaction);
    
    const args = interaction.customId.split('_');
    if (args[2] === 'answer') {
      await interaction.deferReply({ ephemeral: true });
      await interaction.followUp({ content: format(this.strings.currentAnswer, { answer: this.answerContent }) });
    }
  }

  protected idleToDo(nowPlayer: Player): DjsInputResult {
    nowPlayer.status.set("IDLE");
    return {
      components: this.displayBoard, 
    };
  }

  protected playToDo(nowPlayer: Player, input: string): DjsInputResult {
    const args = input.split('_');
    let endStatus = "";

    nowPlayer.status.set("PLAYING");
    nowPlayer.addStep();

    this.flip(parseInt(args[2], 10), parseInt(args[3], 10));

    if (this.game.win()) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }

    return {
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

    this.boardButtons.forEach(row => {
      row.forEach(button => {
        button.setDisabled(true);
      })
    });

    await this.mainMessage?.edit({ components: this.displayBoard }).catch(() => {});
    await this.subMessage?.delete().catch(() => {});
  }


  private get displayBoard(): ActionRowBuilder<ButtonBuilder>[] {
    const actionRows = [];
    for (let i = 0; i < this.game.boardSize; i++) {
      actionRows.push(new ActionRowBuilder<ButtonBuilder>());
      for (let j = 0; j < this.game.boardSize; j++) {
        actionRows[i].addComponents(this.boardButtons[i][j]);
      }
    }
    return actionRows;
  }

  private get answerContent(): string {
    this.answered = true;
    let content = '';
    for (let i = 0; i < this.game.boardSize; i++) {
      for (let j = 0; j < this.game.boardSize; j++)
        content += this.strings.answerSymbols[this.game.answer[i][j] ? 1 : 0];
      content += '\n';
    }
    return content;
  }
}