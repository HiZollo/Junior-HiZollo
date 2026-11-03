import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { BullsAndCows, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsInputResult, DjsBullsAndCowsOptions, BullsAndCowsStrings } from '../../typings/game';

const MAX_CONTENT_LENGTH = 2000;

export class DjsBullsAndCows extends DjsGameWrapper {
  public hardMode: boolean;

  public strings: BullsAndCowsStrings;
  public content: string;
  public gameHeader: string;

  protected game: BullsAndCows;
  protected inputMode: number;
  

  constructor({ players, answerLength = 4, source, time, hardMode = false }: DjsBullsAndCowsOptions) {
    super({ source, time });
    this.game = new BullsAndCows({ players, answerLength });
    this.hardMode = hardMode;

    this.strings = gameString.bullsAndCows;
    this.content = format(this.strings.initial, { player: this.game.playerManager.nowPlayer.username });
    this.gameHeader = this.content;

    this.inputMode = 0b01;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);
  }

  async initialize(): Promise<void> {
    const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_leave')
        .setLabel(this.strings.controller.leave)
        .setStyle(ButtonStyle.Danger)
    )];
    await super.initialize({ content: this.content, components });
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "WIN":
        return format(message.win, { player: `<@${this.winner?.id}>`, answer: this.game.answer.join('') });
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


  protected buttonFilter(): boolean {
    return false;
  }

  protected messageFilter(m: Message): boolean {
    if (m.author.id !== this.game.playerManager.nowPlayer.id) return false;

    if (m.content.length !== this.game.answerLength) return false;
    if (!/^\d+$/.test(m.content)) return false;
    const query = this.getQuery(m.content);
    return (new Set(query)).size === m.content.length;
  }

  protected idleToDo(nowPlayer: Player): DjsInputResult {
    nowPlayer.status.set("IDLE");
    return {};
  }

  protected playToDo(nowPlayer: Player, input: string): DjsInputResult {
    nowPlayer.status.set("PLAYING");
    nowPlayer.addStep();

    const query = this.getQuery(input);
    const status = this.game.guess(query);
    let endStatus = "";
    if (this.game.win(status)) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }

    let content = this.hardMode ? this.gameHeader : this.content;
    content += '\n' + format(this.strings.query, { a: status.a, b: status.b, query: input });
    this.content += '\n' + format(this.strings.query, { a: status.a, b: status.b, query: input });

    return {
      content: content, 
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
    while (result.content && result.content.length > MAX_CONTENT_LENGTH) {
      const matches = result.content.match(/([\s\S]*?)\n([\s\S]*?)\n([\s\S]*)/);
      if (matches) {
        result.content = matches[1] + '\n' + matches[3];
      }
    }
    await this.mainMessage.edit(result).catch(() => {
      result.endStatus = "DELETED";
    });
    return result;
  }

  protected async end(status: string): Promise<void> {
    this.game.end(status);
    await this.mainMessage?.edit({ components: [] }).catch(() => {});
  }
  

  private getQuery(content: string): number[] {
    const query = [];
    for (let c of content) {
      query.push(+c);
    }
    return query;
  }
}