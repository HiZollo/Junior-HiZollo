import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import getActivity from "../features/utils/getActivity";
import { CommandType } from "../utils/enums";

export default class Refresh extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'refresh', 
      description: '重刷我的個人動態', 
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