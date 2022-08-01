import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomInt from "../features/utils/randomInt";
import { CommandType } from "../utils/enums";

export default class Dice extends Command<[number]> {
  constructor() {
    super({
      type: CommandType.Fun, 
      name: 'dice', 
      description: '讓 HiZollo 擲一顆骰子', 
      options: [{
        type: ApplicationCommandOptionType.Integer, 
        name: '點數',
        description: '要顯示的特定點數',
        required: false,
        minValue: 1, 
        maxValue: 6
      }],
      permissions: {
        bot: [PermissionFlagsBits.UseExternalEmojis]
      }
    });
  }

  public async execute(source: Source, [point]: [number]): Promise<void> {
    await source.defer();

    if (point) await source.update(this.pointsEmoji[point-1]);
    else {
      const number = ~~(randomInt(0, 102) / 17);
      if (number === 6) await source.update(`<:hzdice_wth:838041109099446272>\n${source.user}，你擲出了……呃，87 點`);
      else await source.update(`${this.pointsEmoji[number]} 你擲出了 ${number+1} 點！`);
    }
  }

  private pointsEmoji = [
    '<:hzdice_one:836137736317960202>',
    '<:hzdice_two:836137736276148264>',
    '<:hzdice_three:836137736398176256>',
    '<:hzdice_four:838041763436298260>',
    '<:hzdice_five:836137736527937537>',
    '<:hzdice_six:836137736037203969>',
  ];
}
