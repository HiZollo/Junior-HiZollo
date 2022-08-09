import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Noisy extends HiddenCommand {
  constructor() {
    super('noisy');
  }

  public filter(message: Message): boolean {
    let content = message.content.toLowerCase();

    const hzs = [/junior hizollo/, /juniorhizollo/, /hizollo/];
    if (!hzs.some(h => h.test(content))) return false;
    for (const hz of hzs)
      if (hz.test(content)) {
        content = content.replace(hz, '');
        break;
      }

    const noisys = [/吵死了/, /真吵/, /超吵/, /有夠吵/];
    if (!noisys.some(h => h.test(content))) return false;
    for (const noisy of noisys)
      if (noisy.test(content)) {
        content = content.replace(noisy, '');
        break;
      }

    return /^ *$/.test(content);
  }


  public execute(message: Message): boolean {
    return this.epicResponse(message, ['QAQ'], ['我為什麼要憑空接受你的抱怨？你知道是你先說話我才會跟著說嗎？所以是你吵還是我吵？邏輯已死？']);
  }
}