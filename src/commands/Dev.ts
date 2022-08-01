import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Dev extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'dev', 
      description: '顯示 HiZollo 的開發團隊清單', 
      aliases: ['developers'],
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const devlist = new EmbedBuilder()
      .setHiZolloColor()
      .setTitle('HiZollo 開發團隊清單')
      .setFooter({ text: `© HiZollo 2019-${new Date().getFullYear()}` })
      .addFields(
        { name: '專案領導團隊', value: this.members.leading.join('\n') }, 
        { name: '程式團隊', value: this.members.script.join('\n') }, 
        { name: '文案團隊', value: this.members.copywrite.join('\n') }, 
        { name: '網管團隊', value: this.members.website.join('\n') }, 
        { name: '美術團隊', value: this.members.art.join('\n') }
      );
    await source.update({ embeds: [devlist] });
  }

  private members = {
    leading: ['AC0xRPFS001#5007'], 
    art: ['Zollo757347#3987'], 
    script: ['AC0xRPFS001#5007', 'Zollo757347#3987'], 
    copywrite: ['Zollo757347#3987'], 
    website: ['AC0xRPFS001#5007']
  }
}