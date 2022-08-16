import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Purge extends Command<[number]> {
  constructor() {
    super({ 
      type: CommandType.Utility, 
      name: 'purge', 
      description: '刪除頻道中指定數量的訊息', 
      options: [{
        type: ApplicationCommandOptionType.Integer, 
        name: '數量', 
        description: '要刪除的訊息數量', 
        required: true, 
        minValue: 1, 
        maxValue: 99
      }], 
      permissions: {
        bot: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel], 
        user: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      }, 
      twoFactorRequired: true
    });
  }

  public async execute(source: Source, [number]: [number]): Promise<void> {
    await source.hide();

    if (!source.channel || !('bulkDelete' in source.channel)) {
      await source.temp('此指令需要在伺服器的頻道裡才可以使用');
      return;
    }
    await source.channel?.bulkDelete(number, true);
    await source.temp(`已刪除 ${source.channel} 中最近的 ${number} 條訊息`);
  }
}