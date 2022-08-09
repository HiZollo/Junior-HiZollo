import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Noword extends HiddenCommand {
  constructor() {
    super('noword');
  }

  public filter(message: Message): boolean {
    return /^\.{3,}$/.test(message.content.toLowerCase());
  }


  public execute(message: Message): boolean {
    return this.randomResponse(message, ['.......'], ['.......'], ['.......'], ['。。。。。。。']);
  }
}