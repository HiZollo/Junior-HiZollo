import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../utils/enums";

export default class DiepWiki extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Information, 
      name: 'wiki', 
      description: '取得 Diep.io 維基連結'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update('Diep.io 繁中維基是個好地方\nhttps://diepio.fandom.com/zh');
  }
}