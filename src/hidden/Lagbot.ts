import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Lagbot extends HiddenCommand {
  constructor() {
    super('lagbot');
  }

  private lags = ['真慢', '有夠慢', '慢欸', '慢死了', '太慢了吧', 'lag bot', 'laggy bot'];
  public filter(message: Message): boolean {
    return this.lags.includes(message.content);
  }

  private r1 = ['我有什麼辦法啊', '啊我也沒辦法啊', '我能怎麼辦', '啊我能怎樣', '阿所以呢'];
  private r2 = ['所以要怎麼辦', '我沒辦法，你有辦法嗎？'];
  private r3 = ['你確定不是你那邊的問題嗎', '你確定你網路沒問題嗎'];

  public execute(message: Message): boolean {
    return this.randomResponse(message, this.r1, this.r2, this.r3);
  }
}