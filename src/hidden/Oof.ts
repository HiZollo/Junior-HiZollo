import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Oof extends HiddenCommand {
  constructor() {
    super('oof');
  }

  public filter(message: Message): boolean {
    return /^o{2,}f$/.test(message.content.toLowerCase());
  }


  public execute(message: Message): boolean {
    return this.randomResponse(message, ['ooof'], ['ooooof'], ['ƠơỚȱỌǪǫỜờỠŏỖŎŏȎȰꞘ']);
  }
}