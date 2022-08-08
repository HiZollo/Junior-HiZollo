import { Command } from "../classes/Command";
import { CommandType } from "../utils/enums";

export default class Music extends Command<[]> {
  constructor() {
    super({
      type: CommandType.SubcommandGroup, 
      name: 'music', 
      description: '執行音樂指令', 
      aliases: ['m']
    });
  }

  public async execute(): Promise<void> {
    throw new Error('Subcommand group is not executable.');
  }
}
