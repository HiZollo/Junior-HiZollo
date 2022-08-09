import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Gg extends HiddenCommand {
  constructor() {
    super('gg');
  }

  public filter(message: Message): boolean {
    return message.content.toLowerCase() === 'gg';
  }

  private r1 = ['GG!', 'Gg!', 'gg!', 'GG'];
  private r2 = ['Gud Game!', 'Good Game!', 'Great Game'];
  private r3 = ['系統提示：您已獲得ㄐㄐ之力', 'ĞğġǴģg̃ĢĝǦĠᶃꬶḠḡǧǵƓɠǤĜǥꞠꞡG̃'];

  public execute(message: Message): boolean {
    return this.randomResponse(message, this.r1, this.r2, this.r3);
  }
}