import { Message } from "discord.js";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Thanks extends HiddenCommand {
  constructor() {
    super('thanks');
  }

  public filter(message: Message): boolean {
    return message.content.startsWith('???') &&
      (('name' in message.channel && message.channel?.name == '釣魚拉霸室') || message.channel.isTestChannel());
  }


  public execute(message: Message): boolean {
    message.channel.send(
      '==========[祈福]========== \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n' +
      '           !!!!!!!!!感謝上天恩賜!!!!!!!!!  \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! \n' +
      '           !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    );
    return true;
  }
}