import { Command } from "../classes/Command";
import { CommandType } from "../typings/enums";

export default class Timer extends Command<[]> {
  constructor() {
    super({
      type: CommandType.SubcommandGroup, 
      name: 'timer', 
      description: '執行倒數計時器指令'
    });
  }

  public async execute(): Promise<void> {
    throw new Error('Subcommand group is not executable.');
  }
}