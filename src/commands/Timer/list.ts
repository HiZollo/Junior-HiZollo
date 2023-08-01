import { Command } from "@root/src/classes/Command";
import { Source } from "@root/src/classes/Source";
import { listTimers } from "@root/src/features/utils/cdTimerSystem";
import { CommandType } from "@root/src/typings/enums";

export default class CountdownList extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Utility,
      parent: 'timer',
      name: 'list',
      description: '顯示目前的計時器'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update(listTimers(source.user))
  }
}