import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandOptionType, CommandType } from "../utils/enums";

export default class React extends Command<[string]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'react', 
      description: '刪除指定數量的訊息', 
      options: [{
        type: ApplicationCommandOptionType.String, 
        parseAs: CommandOptionType.Emoji, 
        name: '表情', 
        description: '要附加在前一則反應上的表情', 
        required: true
      }], 
      permissions: {
        bot: [PermissionFlagsBits.AddReactions, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel], 
        user: [PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]
      }, 
      twoFactorRequired: true
    });
  }

  public async execute(source: Source, [emoji]: [string]): Promise<void> {
    await source.hide();

    const messages = await source.channel?.messages.fetch({ limit: 1 });
    if (!messages?.size) {
      await source.temp(`我找不到上一則訊息欸，可不可以再確認一下`);
      return;
    }

    messages.first()?.react(emoji).then(async () => {
      await source.temp(`已成功反應表情 ${emoji}`);
    }).catch(async () => {
      await source.temp(`反應表情失敗，可能是因為這個表情不存在，或是上一則訊息的反應已經滿了`);
    });
  }
}