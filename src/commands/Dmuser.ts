import { ApplicationCommandOptionType, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Dice extends Command<[User, string]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'dmuser', 
      description: 'DM 一位指定使用者', 
      options: [{
        type: ApplicationCommandOptionType.User, 
        name: '使用者',
        description: '要傳送到誰的 DM',
        required: true
      }, {
        type: ApplicationCommandOptionType.String, 
        name: '訊息', 
        description: '要傳送的訊息', 
        required: true
      }],
    });
  }

  public async execute(source: Source, [user, content]: [User, string]): Promise<void> {
    await source.defer();
    await user.send(new Function(`return \"${content}\"`)());
    await source.update('你的訊息已成功傳送');
  }
}