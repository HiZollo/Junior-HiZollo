import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Omg extends HiddenCommand {
  constructor() {
    super('omg');
  }

  public filter(message: Message): boolean {
    return /^o+mg$/.test(message.content.toLowerCase());
  }


  public execute(message: Message): boolean {
    return this.rareResponse(message, ['Oh my God!'], ['我的老天鵝阿'], ['oH mY GOd']);
  }
}