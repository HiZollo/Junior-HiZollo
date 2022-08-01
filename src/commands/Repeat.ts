import { ApplicationCommandOptionType } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ArgumentParseType, CommandType } from "../utils/enums";

export default class Repeat extends Command<[string]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'repeat', 
      description: '命令 HiZollo 複讀一句話', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '訊息', 
        description: '要 HiZollo 複讀的訊息', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }
    });
  }

  public async execute(source: Source, [content]: [string]): Promise<void> {
    await source.defer({ ephemeral: true });
    await source.update({
      content: content,
      allowedMentions: {
        parse: ['users']
      }
    });
  }
}