import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Lanbot extends HiddenCommand {
  constructor() {
    super('lanbot');
  }

  private lans = ['爛bot', '超爛bot'];
  public filter(message: Message): boolean {
    return this.lans.includes(message.content);
  }

  private r1 = ['我才不是爛 bot', '嗚嗚', 'QAQ', '......', '你叫誰爛 bot 啊'];
  private r2 = ['是 JavaScript 爛，不是我', '你才比較爛吧', '是開發我的人爛'];
  private r3 = [{ files: ['./src/pictures/badbot.jpg'] }];

  public execute(message: Message): boolean {
    return this.alwaysResponse(message, this.r1, this.r2, this.r3);
  }
}