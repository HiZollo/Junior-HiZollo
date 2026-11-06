/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { ActionRowBuilder, ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, ButtonBuilder, Client, EmbedBuilder, GuildMember, InteractionReplyOptions, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import config from "@root/config";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../typings/enums";
import { HZCommandOptionData } from "../typings/types";
import { SubcommandGroup } from "../typings/interfaces";
import { Translator } from "../classes/Translator";

export default class Help extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Information, 
      name: 'help', 
      description: '顯示 HiZollo 的指令列表或查詢指令用法', 
      options: [{ 
        type: ApplicationCommandOptionType.String, 
        name: '指令名稱', 
        description: '要查詢的特定指令', 
        required: false, 
        autocomplete: true
      }], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source, [commandName]: [string]): Promise<void> {
    // 不給參數時就顯示所有指令
    if (!commandName) {
      await source.defer();
      const message = this.getMessageForAllTypes(source);
      await source.update(message);
      return;
    }

    // 給參數就顯示特定指令
    const command = source.client.commands.search([commandName, undefined]);
    if (!command || (command instanceof Command && command.type === CommandType.Developer && !source.channel?.isTestChannel())) {
      await source.defer({ ephemeral: true });
      await source.update(`這個指令不存在，請使用 \`${config.bot.prefix}help\` 或 \`/help\` 查看當前的指令列表`);
      return;
    }

    await source.defer();
    const embed = command instanceof Command ? this.getEmbedForCommand(source, command) : this.getEmbedForSubcommandGroup(source, commandName, command);
    await source.update({ embeds: [embed] });
  }
  

  public getMessageForAllTypes(source: Source) {
    return {
      components: this.getComponentsForAllTypes(), 
      embeds: this.getEmbedsForAllTypes(source)
    };
  }

  public getComponentsForAllTypes(): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu_main')
      .setPlaceholder('請選擇一個指令分類');
    
    for (const type of Object.values(CommandType).filter((t): t is CommandType => typeof t === 'number')) {
      if (type === CommandType.Developer) continue;
      menu.addOptions({
        label: Translator.getCommandTypeChinese(type), 
        description: Translator.getCommandTypeChineseDescription(type), 
        emoji: '🔹', 
        value: `${type}`
      });
    }

    return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
  }

  public getEmbedsForAllTypes(source: Source): EmbedBuilder[] {
    const embed = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的幫助中心', '使用指令時不須連同 [] 或 <> 一起輸入')
      .setDescription(`以下是我的指令列表，你可以使用 \`${config.bot.prefix}help 指令名稱\` 或 \`/help 指令名稱\` 來查看特定指令的使用方法`)
      .setThumbnail(source.client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null);

    let counter = 0;
    for (const type of Object.values(CommandType).filter((t): t is CommandType => typeof t === 'number')) {
      if (type === CommandType.Developer) continue;

      embed.addFields({
        name: `🔹 **${Translator.getCommandTypeChinese(type)}**`, 
        value: Translator.getCommandTypeChineseDescription(type), 
        inline: true
      });
      counter++;
      if (counter % 2 === 1) {
        embed.addFields({ name: '\u200b',  value: '\u200b', inline: true });
      }
    }
    
    return [embed];
  }

  
  public getMessageForType(interaction: StringSelectMenuInteraction<"cached">, type: CommandType): InteractionReplyOptions {
    return {
      components: this.getComponentsForType(interaction, type), 
      embeds: this.getEmbedsForType(interaction, type)
    };
  }

  public getComponentsForType(interaction: StringSelectMenuInteraction<"cached">, type: CommandType): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu_type')
      .setPlaceholder('請選擇一個指令');
    const commands = type === CommandType.SubcommandGroup ?
      interaction.client.commands.subcommands.map(c => c) :
      interaction.client.commands.map(c => c).filter(c => c.type === type);

    commands.forEach(command => {
      menu.addOptions({
        label: command.name, 
        description: command.description, 
        emoji: '🔹', 
        value: command.name
      })
    });

    return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
  }

  public getEmbedsForType(interaction: StringSelectMenuInteraction<"cached">, type: CommandType): EmbedBuilder[] {
    let description =
      `以下是所有**${Translator.getCommandTypeChinese(type)}**分類中的指令\n` +
      `你可以使用 \`${config.bot.prefix}help 指令名稱\` 或 \`/help 指令名稱\` 來查看特定指令的使用方法\n\n`;

    const commands = type === CommandType.SubcommandGroup ?
      interaction.client.commands.subcommands.map(c => c) :
      interaction.client.commands.map(c => c).filter(c => c.type === type);
    
    description += commands.map(c => `\`${c.name}\``).join('．');

    return [
      new EmbedBuilder()
        .applyHiZolloSettings(interaction.member, 'HiZollo 的幫助中心', '使用指令時不須連同 [] 或 <> 一起輸入')
        .setDescription(description)
        .setThumbnail(interaction.client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null)
    ];
  }

  public getEmbedForCommand(source: { client: Client, member: GuildMember }, command: Command): EmbedBuilder {
    return new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的幫助中心', '使用指令時不須連同 [] 或 <> 一起輸入')
      .setDescription(this.getDescriptionForCommand(command))
      .setThumbnail(source.client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null);
  }

  public getEmbedForSubcommandGroup(source: { client: Client, member: GuildMember }, groupName: string, commands: SubcommandGroup): EmbedBuilder {
    const embed = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的幫助中心', '使用指令時不須連同 [] 或 <> 一起輸入')
      .setDescription(`這是 HiZollo 的 ${groupName} 指令列表`)
      .setThumbnail(source.client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null);

    commands.data.each(command => {
      let description = `** - 指令功能：**${command.description}\n` + this.getDescriptionForCommand(command, true);
      embed.addFields({ name: `${groupName} ${command.name}`, value: description });
    });
    return embed;
  }

  private getDescriptionForCommand(command: Command, isSubcommand?: boolean): string {
    let description = !isSubcommand ? `\`${command.name}\`\n${command.description}\n` : '';
    if (!isSubcommand && command.extraDescription) description += `${command.extraDescription}\n`;
    if (!isSubcommand) description += '\n';
    if (command.aliases) description += `** - 替代名稱：**${command.aliases.map(a => `\`${a}\``).join(', ')}\n`;
    if (!isSubcommand && command.type) description += `** - 分類位置：**${Translator.getCommandTypeChinese(command.type)}\n`;
    if (command.options) description += `** - 指令參數：**${this.optionsToString(command.options)}`;
    if (command.cooldown) description += `** - 冷卻時間：**${command.cooldown} 秒\n`;
    return description;
  }
  
  private optionsToString(options: HZCommandOptionData[]): string {
    let description = '';
    description += `\`${options.map(option => this.getOptionNameString(option)).join(' ')}\`\n`;
    for (const option of options) {
      description += ` \`${this.getOptionNameString(option)}\`\n`;
      description += `　- 選項說明：${option.description}\n`
      description += `　- 規範型別：${Translator.getCommandOptionTypeChinese(option)}\n`;
      if ('choices' in option && option.choices) {
        description += `　- 規範選項：${option.choices.map(choice => this.getChoiceString(choice)).join('．')}\n`;
      }
      if ('minValue' in option || 'maxValue' in option) {
        description += `　- 數值範圍：\`${option.minValue !== undefined ? `[${option.minValue}` : '(-∞'}, ${option.maxValue !== undefined ? `${option.maxValue}]` : '∞)'}\``;
      }
      if ('minLength' in option || 'maxLength' in option) {
        description += `　- 長度範圍：\`${option.minLength !== undefined ? `[${option.minLength}` : '(0'}, ${option.maxLength !== undefined ? `${option.maxLength}]` : '∞)'}\``;
      }
    }
    return description;
  }

  private getOptionNameString(option: HZCommandOptionData): string {
    const pattern = option.required ? `[${option.name}]` : `<${option.name}>`;
    if (!option.repeat) return pattern;
    return `${pattern.replace(/\%i/g, '1')} ${pattern.replace(/\%i/g, '2')} ...`
  }

  private getChoiceString(choice: ApplicationCommandOptionChoiceData): string {
    return choice.name === choice.value.toString() ? `\`${choice.name}\`` : `\`${choice.name}\`/\`${choice.value}\``;
  }
}
