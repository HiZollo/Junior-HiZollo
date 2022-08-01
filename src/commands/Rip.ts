import { PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Rip extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Miscellaneous, 
      name: 'rip', 
      description: 'RIP!', 
      permissions: {
        bot: [PermissionFlagsBits.AttachFiles, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel], 
        user: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel]
      }, 
      twoFactorRequired: true
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.hide();
    await source.channel?.send({ files: ['https://i.imgur.com/w3duR07.png'] });
    await source.editReply('RIP!');
  }
}