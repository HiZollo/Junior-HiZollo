import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { AI, FinalCode, Player } from '@hizollo/games';
import { DjsGameWrapper } from './DjsGameWrapper';
import gameString from '../../features/info/gameString';
import format from '../../features/utils/format';
import { DjsInputResult, DjsFinalCodeOptions, FinalCodeStrings } from '../../typings/game';

export class DjsFinalCode extends DjsGameWrapper {
  public strings: FinalCodeStrings;

  protected game: FinalCode;
  protected inputMode: number;


  constructor({ players, range, source, time }: DjsFinalCodeOptions) {
    super({ source, time });
    this.game = new FinalCode({ players, range });

    this.strings = gameString.finalCode;

    this.inputMode = 0b01;
    this.buttonFilter = this.buttonFilter.bind(this);
    this.messageFilter = this.messageFilter.bind(this);
  }

  async initialize(): Promise<void> {
    const content = format(this.strings.interval, { min: this.game.range.min, max: this.game.range.max }) + '\n'
                  + format(this.strings.nowPlayer, { player: `<@${this.game.playerManager.nowPlayer.id}>` });
    const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('HZG_CTRL_leave')
        .setLabel(this.strings.controller.leave)
        .setStyle(ButtonStyle.Danger)
    )];
    await super.initialize({ content, components })
  }

  getEndContent(): string {
    const message = this.strings.endMessages;
    switch (this.game.status.now) {
      case "WIN":
        return format(message.win, { player: `<@${this.winner?.id}>`, answer: this.game.answer });
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

    const query = +m.content;
    if (isNaN(query) || query !== ~~query) return false;
    return this.game.range.inOpenRange(query);
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

    const query = +input;
    const result = this.game.guess(query);
    let content = '\u200b';
    let endStatus = "";

    if (result === 0) {
      this.winner = nowPlayer;
      endStatus = "WIN";
    }
    else {
      content = result > 0 ?
        format(this.strings.previous.tooLarge, { query }) + '\n' :
        format(this.strings.previous.tooSmall, { query }) + '\n';
    }

    return {
      content: content, 
      endStatus: endStatus
    };
  }

  protected async botMove(bot: Player): Promise<DjsInputResult> {
    bot.addStep();

    const query = await AI.FinalCode(this.game.range);
    const result = this.game.guess(query);
    let content = '\u200b';
    let endStatus = "";

    if (result === 0) {
      this.winner = bot;
      endStatus = "WIN";
    }
    else {
      content = result > 0 ?
        format(this.strings.previous.tooLarge, { query }) + '\n' :
        format(this.strings.previous.tooSmall, { query }) + '\n';
    }

    return {
      content: content, 
      endStatus: endStatus
    };
  }

  protected async update(result: DjsInputResult): Promise<DjsInputResult> {
    if (!this.mainMessage) {
      throw new Error("The main message of the game is invalid.");
    }

    this.game.playerManager.next();
    result.content += format(this.strings.interval, { min: this.game.range.min, max: this.game.range.max }) + '\n';
    result.content += format(this.strings.nowPlayer, { player: `<@${this.game.playerManager.nowPlayer.id}>` });
    await this.mainMessage.edit(result).catch(() => {
      result.endStatus = "DELETED";
    });
    return result;
  }

  protected async end(status: string): Promise<void> {
    this.game.end(status);

    const content = format(this.strings.interval, { min: this.game.range.min, max: this.game.range.max })
    await this.mainMessage?.edit({ content: content, components: [] }).catch(() => {});
  }
}