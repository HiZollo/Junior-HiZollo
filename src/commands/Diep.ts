import { Command } from "../classes/Command";
import { CommandType } from "../utils/enums";

export default class Diep extends Command<[]> {
  constructor() {
    super({
      type: CommandType.SubcommandGroup, 
      name: 'diep', 
      description: '執行 Diep.io 的相關指令', 
      aliases: ['d']
    });
  }

  public async execute(): Promise<void> {
    throw new Error('Subcommand group is not executable.');
  }
}
