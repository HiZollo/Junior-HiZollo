import { ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { FlipTrip, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsFlipTripOptions, DjsInputResult, FlipTripStrings } from '../../typings/game';

const MAX_BUTTON_PER_ROW = 5;

export class DjsFlipTrip extends DjsGameWrapper {
  public strings: FlipTripStrings;

  protected game: FlipTrip;
  protected inputMode: number;
  protected boardButtons: ActionRowBuilder<ButtonBuilder>[];

  
  constructor({ players, boardSize, source, time }: DjsFlipTripOptions) {
    super({ source, time });
    this.game = new FlipTrip({ players, boardSize });

    this.strings = gameString.flipTrip;

    this.inputMode = 0b10;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);

    this.boardButtons = [];
  }

  async initialize(): Promise<void> {
    for (let i = 0; i < this.game.boardSize; i++) {
      if (i % MAX_BUTTON_PER_ROW === 0) {
        this.boardButtons.push(new ActionRowBuilder<ButtonBuilder>());
      }
      this.boardButtons[~~(i / MAX_BUTTON_PER_ROW)].addComponents(
        new ButtonBuilder()
          .setCustomId(`HZG_PLAY_${this.game.boardSize - 1 - i}`)
          .setLabel(`${this.game.boardSize - i}`)
          .setStyle(ButtonStyle.Primary)
      );
    }

    const components = [
      ...this.boardButtons, 
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('HZG_CTRL_leave')
          .setLabel(this.strings.controller.leave)
          .setStyle(ButtonStyle.Danger)
      )
    ];

    await super.initialize({ content: this.boardContent, components });
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "WIN":
        return format(message.win, { player: `<@${this.winner?.id}>`, size: this.game.boardSize });
      case "LOSE":
        return format(message.lose, { player: `<@${this.loser?.id}>`, state: this.pieces, perm: this.game.permutationCount - this.game.playerManager.totalSteps });
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
    return {
      content: this.boardContent, 
    };
  }

  protected playToDo(nowPlayer: Player, input: string): DjsInputResult {
    const args = input.split('_');
    let endStatus = "";
    
    nowPlayer.status.set("PLAYING");
    nowPlayer.addStep();

    const legal = this.game.flip(parseInt(args[2], 10));

    if (!legal) {
      this.loser = nowPlayer;
      endStatus = "LOSE";
    }
    else if (this.game.win()) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }

    return {
      content: this.boardContent, 
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

    await this.mainMessage?.edit({ components: [] }).catch(() => {});
  }


  private get boardContent(): string {
    let boardContent = '';
    for (let i = this.game.boardSize - 1; i >= 0; i--) {
      boardContent += this.strings.numbers[i];
    }
    boardContent += '\n';
    boardContent += this.pieces;

    return boardContent;
  }

  private get pieces() {
    let result = '';
    for (let i = this.game.boardSize - 1; i >= 0; i--) {
      result += this.strings.pieces[(this.game.state & (1 << i)) ? 1 : 0];
    }
    return result;
  }
}