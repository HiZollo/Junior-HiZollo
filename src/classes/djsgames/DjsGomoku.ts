import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { Gomoku, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsGomokuOptions, DjsInputResult, GomokuStrings } from '../../typings/game';

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class DjsGomoku extends DjsGameWrapper {
  public strings: GomokuStrings;

  protected game: Gomoku;
  protected inputMode: number;

  
  constructor({ players, boardSize = 9, source, time }: DjsGomokuOptions) {
    super({ source, time });
    if (!(1 <= boardSize && boardSize <= 19)) {
      throw new Error("Parameter boardSize has to be in [1, 19].");
    }
    this.game = new Gomoku({ players, boardSize });

    this.strings = gameString.gomoku;

    this.inputMode = 0b01;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);
  }

  async initialize(): Promise<void> {
    const player = this.game.playerManager.nowPlayer;
    const content = format(this.strings.nowPlayer, { player: `<@${player.id}>`, symbol: player.symbol });
    const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_leave')
        .setLabel(this.strings.controller.leave)
        .setStyle(ButtonStyle.Danger)
    )];
    await super.initialize({ content, components });
    await this.mainMessage?.edit(content + '\n' + this.boardContent);
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "WIN":
        return format(message.win, { player: `<@${this.winner?.id}>` });
      case "IDLE":
        return message.idle;
      case "DRAW":
        return message.draw;
      case "STOPPED":
        return message.stopped;
      case "DELETED":
        return message.deleted;
      default:
        return '';
    }
  }


  protected buttonFilter(): boolean {
    return false;
  }

  protected messageFilter(m: Message): boolean {
    if (m.author.id !== this.game.playerManager.nowPlayer.id) return false;
    if (!(/^[A-Za-z]\d{1,2}$/.test(m.content))) return false;

    const [row, col] = this.getQuery(m.content);
    if (!(0 <= row && row < this.game.boardSize && 0 <= col && col < this.game.boardSize)) return false;
    return this.game.board[row][col] === null;
  }

  protected idleToDo(nowPlayer: Player): DjsInputResult {
    nowPlayer.status.set("IDLE");
    return {
      content: format(this.strings.previous.idle, { player: nowPlayer.username }) + '\n', 
    };
  }

  protected playToDo(nowPlayer: Player, input: string): DjsInputResult {
    nowPlayer.status.set("PLAYING");
    nowPlayer.addStep();

    const [row, col] = this.getQuery(input);
    let endStatus = "";
    this.game.fill(row, col);

    if (this.game.win(row, col)) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }
    else if (this.game.draw()) {
      endStatus = "DRAW";
    }

    return {
      content: format(this.strings.previous.move, { col: alphabets[col], row: row + 1, player: nowPlayer.username }) + '\n', 
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
    result.content += format(this.strings.nowPlayer, { player: `<@${this.game.playerManager.nowPlayer.id}>`, symbol: this.game.playerManager.nowPlayer.symbol })
                    + '\n' + this.boardContent;
    await this.mainMessage.edit(result).catch(() => {
      result.endStatus = "DELETED";
    });
    return result;
  }

  protected async end(status: string): Promise<void> {
    this.game.end(status);

    await this.mainMessage?.edit({ content: this.boardContent, components: [] }).catch(() => {});
  }


  private get boardContent(): string {
    let content = `${this.strings.corner}`;
    for (let i = 0; i < this.game.boardSize; i++) {
      content += '\u200b' + this.strings.columns[i];
    }

    for (let i = this.game.boardSize - 1; i >= 0; i--) {
      content += '\n' + this.strings.rows[i];
      for (let j = 0; j < this.game.boardSize; j++)
        content += this.game.board[i][j] !== null ? this.game.board[i][j] : this.strings.grid;
    }
    return content;
  }

  private getQuery(content: string): number[] {
    let [_, col, row] = content.toLowerCase().match(/([a-z])(\d{1,2})/) ?? ['', 'Z', '100'];
    return [parseInt(row, 10) - 1, col.charCodeAt(0) - 'a'.charCodeAt(0)];
  }
}