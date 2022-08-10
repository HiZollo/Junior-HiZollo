import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Haha extends HiddenCommand {
  constructor() {
    super('haha');
  }

  public filter(message: Message): boolean {
    return /^[哈呵ㄏ]+$/.test(message.content);
  }

  private r1 = [
    '哈', '哈哈', '哈哈哈',
    '呵', '呵呵', '呵呵呵',
    'ㄏ', 'ㄏㄏ', 'ㄏㄏㄏ',
    'w', 'www', 'www'
  ];
  private r2 = ['你要不要吃……哈…呵伊阿…'];

  public execute(message: Message): boolean {
    return this.rareResponse(message, this.r1, this.r1, this.r2);
  }
}