import { Message } from "discord.js";
import config from "../config";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Useful extends HiddenCommand {
  constructor() {
    super('useful');
  }

  public filter(message: Message): boolean {
    return message.content === `${config.bot.prefix}useful`;
  }


  public execute(message: Message): boolean {
    message.channel.send('這是一個有用的指令，嘿嘿');
    return true;
  }
}