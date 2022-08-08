import { Command } from "../classes/Command";
import { CommandType } from "../utils/enums";

export default class Osu extends Command<[]> {
  constructor() {
    super({
      type: CommandType.SubcommandGroup, 
      name: 'osu', 
      description: '執行 osu! 的相關指令', 
      aliases: ['o']
    });
  }

  public async execute(): Promise<void> {
    throw new Error('Subcommand group is not executable.');
  }
}
