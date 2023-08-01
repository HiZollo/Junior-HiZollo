import { Command } from "@root/src/classes/Command";
import { Source } from "@root/src/classes/Source";
import { addTimer } from "@root/src/features/utils/cdTimerSystem";
import convertToMs from "@root/src/features/utils/convertToMs";
import { CommandType } from "@root/src/typings/enums";
import { ApplicationCommandOptionType } from "discord.js";

export default class TimerAdd extends Command<[string, string]> {
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