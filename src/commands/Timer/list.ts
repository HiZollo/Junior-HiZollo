import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../typings/enums";
import { listTimers } from "../Timer";

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