import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import convertToMs from "../../features/utils/convertToMs";
import { CommandType } from "../../typings/enums";
import { ApplicationCommandOptionType } from "discord.js";
import { addTimer } from "../Timer";

export default class CountdownAdd extends Command<[string, string]> {
  constructor() {
    super({
      type: CommandType.Utility,
      parent: 'timer',
      name: 'add',
      description: '建立一個計時器',
      options: [{
        type: ApplicationCommandOptionType.String,
        name: '時間',
        description: '支援格式: 3:00, 1h30m15s',
        required: true
      },
      {
        type: ApplicationCommandOptionType.String,
        name: '註解',
        description: '附加的提示內容',
        required: false
      }]
    });
  }

  public async execute(source: Source, [time, note]: [string, string]): Promise<void> {
    await source.defer();
    await source.update(addTimer(source.user, source.channel, convertToMs(time), note))
  }
}