import { Message } from "discord.js";
import config from "@root/config";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Wronghelp extends HiddenCommand {
  constructor() {
    super('wronghelp');
  }

  public filter(message: Message): boolean {
    let {content} = message;
    if (!content.startsWith(config.bot.prefix)) return false;
    content = content.slice(config.bot.prefix.length);

    if (content === 'help') return false;
    if (/^[hygjn][e3wrd][lok;\.][p0o\[;]$/.test(content)) return true;
    if (content.length !== 4) return false;
    return content.split('').sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0)).join('') === 'ehlp';
  }


  public execute(message: Message): boolean {
    message.channel.send('在尋求幫助時請先確定你會拼英文單字');
    return true;
  }
}