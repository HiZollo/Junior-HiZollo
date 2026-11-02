import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { Chess, ChessPiece, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsChessOptions, DjsInputResult, GameStrings } from '../../typings/game';

export class DjsChess extends DjsGameWrapper {
  protected game: Chess;
  protected inputMode: number;

  public strings: GameStrings;
  
  constructor({ players, source, time }: DjsChessOptions) {
    super({ source, time });
    this.game = new Chess({ players });

    this.strings = gameString.chess;

    this.inputMode = 0b01;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);
  }

  async initialize(): Promise<void> {
    const player = this.game.playerManager.nowPlayer;
    const content = format(gameString.chess.nowPlayer, { player: `<@${player.id}>`, symbol: player.symbol });
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
    const message = gameString.chess.endMessages;
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
    // if (m.author.id !== this.game.playerManager.nowPlayer.id) return false;
    const move = this.game.parseNotation(m.content);
    console.log(move, !move.error);
    return !move.error;
  }

  protected idleToDo(nowPlayer: Player): DjsInputResult {
    nowPlayer.status.set("IDLE");
    return {
      content: format(gameString.chess.previous.idle, { player: nowPlayer.username }) + '\n', 
    };
  }

  protected playToDo(nowPlayer: Player, input: string): DjsInputResult {
    nowPlayer.status.set("PLAYING");
    nowPlayer.addStep();

    let endStatus = "";
    this.game.move(input);

    if (this.game.win()) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }
    else if (this.game.draw()) {
      endStatus = "DRAW";
    }

    return {
      content: format(gameString.chess.previous.move, { move: input }) + '\n', 
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
    result.content += format(gameString.chess.nowPlayer, { player: `<@${this.game.playerManager.nowPlayer.id}>`, symbol: this.game.playerManager.nowPlayer.symbol })
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
    let content = "";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        content += this.pieceTable[this.game.board[i][j]];
      }
      content += "\n";
    }
    return content;
  }

  private pieceTable: Record<number, string> = {
    [ChessPiece.WP]: "Ｐ",
    [ChessPiece.WN]: "Ｎ",
    [ChessPiece.WB]: "Ｂ",
    [ChessPiece.WR]: "Ｒ",
    [ChessPiece.WQ]: "Ｑ",
    [ChessPiece.WK]: "Ｋ",
    [ChessPiece.BP]: "ｐ",
    [ChessPiece.BN]: "ｎ",
    [ChessPiece.BB]: "ｂ",
    [ChessPiece.BR]: "ｒ",
    [ChessPiece.BQ]: "ｑ",
    [ChessPiece.BK]: "ｋ",
    [ChessPiece.OO]: "　"
  };
}