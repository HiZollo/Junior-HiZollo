import { Command } from "../classes/Command";
import { CommandType } from "../utils/enums";
import { Source } from "../classes/Source";

export default class Respawn extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Developer, 
      name: 'respawn', 
      description: '重新生成所有分支', 
      aliases: ['rsp']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.hide();
    await source.edit('已開始重設所有分支');
    await source.client.shard?.respawnAll();
  }
}