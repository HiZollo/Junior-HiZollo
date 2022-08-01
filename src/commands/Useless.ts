import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Useless extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'useless', 
      description: 'Useless.'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update('這是一個沒用的指令，哈哈');
  }
}