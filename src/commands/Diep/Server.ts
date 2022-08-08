import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../utils/enums";

export default class DiepServer extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Information, 
      parent: 'diep', 
      name: 'server', 
      description: '顯示 Diep.io 繁中維基的伺服器連結', 
      aliases: ['discord']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update('以下為 Diep.io 繁中維基的官方伺服器連結：\nhttps://discord.gg/HpCfgrW');
  }
}