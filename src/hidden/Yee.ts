import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Yee extends HiddenCommand {
  constructor() {
    super('yee');
  }

  public filter(message: Message): boolean {
    return /^ye{2,}$/.test(message.content.toLowerCase());
  }


  public execute(message: Message): boolean {
    return this.randomResponse(message, ['yeee'], ['yeeeeeeee'], ['yEEEEeEEeEeeEeE'], ['YĒÊêềËĔËëëĒĕÈèēÉé']);
  }
}