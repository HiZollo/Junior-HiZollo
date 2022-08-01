import { mainGuild } from "../constant.json";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Sponsor extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Contact, 
      name: 'sponsor', 
      description: '顯示贊助資訊', 
      aliases: ['donate']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update(
      'HiZollo 是所有功能都免費的，現在是，未來也是，這也意味著開發者幾乎沒有任何收益\n'+
      '如果你很喜歡 HiZollo，你可以考慮給我們一點小小的報酬，這將是我們持續前進的動力\n'+
      '我們現在並沒有收取現金的管道，但你還是可以透過贈送 Nitro 等禮物來支持我們\n'+
      `只要你同意，禮物將會作為 ${mainGuild.name}活動的獎勵，回饋給所有 HiZollo 的使用者\n`+
      `如果你找不到開發者，就來 ${mainGuild.name}看看吧，他們永遠都在那裡\n`+
      `${mainGuild.inviteLink}`
    );
  }
}