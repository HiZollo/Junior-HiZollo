import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import getActivity from "../features/utils/getActivity";
import { CommandType } from "../utils/enums";

export default class Refresh extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'refresh', 
      description: '不喜歡 HiZollo 現在的動態嗎？嗯……給你個機會重刷好了', 
      cooldown: 600
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const activity = await getActivity(source.client);
    source.client.user?.setActivity(activity);
    await source.update(`✅｜已將機器人動態更改為 \`${activity}\``);
  }
}