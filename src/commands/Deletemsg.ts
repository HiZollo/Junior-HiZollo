import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Deletemsg extends Command<[number]> {
  constructor() {
    super({ 
      type: CommandType.Utility, 
      name: 'deletemsg', 
      description: `在指定時間後刪除此指令的前一則訊息`, 
      options: [{
        type: ApplicationCommandOptionType.Number, 
        name: '時間', 
        description: '多久後刪除訊息，單位為秒', 
        required: true, 
        minValue: 1, 
        maxValue: 120
      }],
      permissions: {
        bot: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel],
        user: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      }, 
      twoFactorRequired: true
    });
  }

  public async execute(source: Source, [time]: [number]): Promise<void> {
    await source.hide();

    const message = (await source.channel?.messages.fetch({ limit: 1 }))?.first();
    if (!message?.deletable) {
      await source.temp('我無法刪除這則訊息');
      return;
    }

    setTimeout(async () => {
      await message.delete().catch(() => {});
      await source.temp('已刪除指定訊息');
    }, time*1000);
  }
}