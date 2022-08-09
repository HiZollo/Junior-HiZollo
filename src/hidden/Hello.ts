import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Hello extends HiddenCommand {
  constructor() {
    super('hello');
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

    const hellos = [/你好/, /哈囉/, /嗨/];
    if (!hellos.some(h => h.test(content))) return false;
    for (const hello of hellos)
      if (hello.test(content)) {
        content = content.replace(hello, '');
        break;
      }

    return /^ *$/.test(content);
  }


  public execute(message: Message): boolean {
    message.channel.send(`嗨，${message.author}`);
    return true;
  }
}