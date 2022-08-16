import { PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomInt from "../features/utils/randomInt";
import { CommandType } from "../utils/enums";

export default class Coin extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'coin', 
      description: '讓我幫你丟一枚硬幣',
      permissions: {
        bot: [PermissionFlagsBits.AttachFiles],
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const message = await source.update('你把一枚硬幣丟到了桌上……');
    const n = randomInt(1, 100);
    let content = '', url = './src/pictures/';
    if (n <= 48) {
      content = '你丟出了正面！';
      url += 'coin-head.png';
    } else if (n <= 96) {
      content = '你丟出了反面！';
      url += 'coin-tail.png';
    } else if (n <= 97) {
      content = '等等，硬幣立了起來';
      url += 'coin-stand.png';
    } else if (n <= 98) {
      content = '欸不是，硬幣跑到哪裡去了'
      url += 'coin-disappear.png';
    } else {
      content = '哇！變成了一百塊！你是怎麼做到的？';
      url += 'coin-hundred.png';
    }
    setTimeout(async () => {
      await message.edit({
        content: content,
        files: [{ attachment: url, name: 'coin.png' }]
      });
    }, 1900);
  }
}
