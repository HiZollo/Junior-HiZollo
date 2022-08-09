import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Www extends HiddenCommand {
  constructor() {
    super('www');
  }

  public filter(message: Message): boolean {
    return /^[wWŵŴM]{3,}$/.test(message.content);
  }


  public execute(message: Message): boolean {
    return this.randomResponse(message, ['w'], ['www'], ['wwwwww'], ['ŵŵwŴWMŴMWwwŴwMŵWŵMŴwŵŵŴ']);
  }
}