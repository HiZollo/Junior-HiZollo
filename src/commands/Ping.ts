import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Ping extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'ping', 
      description: '看看 HiZollo 的跑速，快還要更快……蛤你說很慢嗎？所以呢？'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const message = await source.update('計算中……');
    const ping = message.createdTimestamp - source.createdTimestamp;
    await message.edit(`:information_source:｜Pong！機器人延遲為：${ping}ms，API延遲為：${source.client.ws.ping}ms`);
  }
}