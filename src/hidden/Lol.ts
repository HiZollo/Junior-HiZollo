import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Lol extends HiddenCommand {
  constructor() {
    super('lol');
  }

  public filter(message: Message): boolean {
    return /^lo+l$/.test(message.content.toLowerCase());
  }

  private r1 = ['loooooooooool'];
  private r2 = ['LoOoOoOoL'];
  private r3 = ['你已被 LOOOOOOOOL 之神造訪', 'ⱠƠǪỜỠỖỚỌḼ'];

  public execute(message: Message): boolean {
    return this.rareResponse(message, this.r1, this.r2, this.r3);
  }
}