/*
 *
 * Copyright 2026 HiZollo Dev Team <https://github.com/hizollo>
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

import { ApplicationCommandOptionChoiceData, Collection, EmbedBuilder } from "discord.js";
import { Command } from "./Command";
import type { Source } from "./Source";
import { HZCommandOptionData } from "../typings/types";
import { Translator } from "./Translator";

export class CommandHelpRenderer extends null {
  /**
   * 顯示指定群組的指令列表
   */
  static async show(source: Source, groupName: string, commands: Collection<string, Command>): Promise<void> {
    await source.defer();
    const embed = this.getGroupEmbed(source, groupName, commands);
    await source.update({ embeds: [embed] });
  }

  static getGroupEmbed(source: Source, groupName: string, commands: Collection<string, Command>): EmbedBuilder {
    const embed = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的幫助中心', '使用指令時不須連同 [] 或 <> 一起輸入')
      .setDescription(`這是 HiZollo 的 ${groupName} 指令列表`)
      .setThumbnail(source.client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null);

    commands.each(command => {
      const description = `** - 指令功能：**${command.description}\n` + this.getDescriptionForCommand(command, true);
      embed.addFields({ name: `${groupName} ${command.name}`, value: description });
    });
    return embed;
  }

  static getDescriptionForCommand(command: Command, isSubcommand = false): string {
    let description = !isSubcommand ? `\`${command.name}\`\n${command.description}\n` : '';
    if (!isSubcommand && command.extraDescription) description += `${command.extraDescription}\n`;
    if (!isSubcommand) description += '\n';
    if (command.aliases) description += `** - 替代名稱：**${command.aliases.map(a => `\`${a}\``).join(', ')}\n`;
    if (!isSubcommand && command.type) description += `** - 分類位置：**${Translator.getCommandTypeChinese(command.type)}\n`;
    if (command.options) description += `** - 指令參數：**${this.optionsToString(command.options)}`;
    if (command.cooldown) description += `** - 冷卻時間：**${command.cooldown} 秒\n`;
    return description;
  }

  private static optionsToString(options: HZCommandOptionData[]): string {
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

  private static getOptionNameString(option: HZCommandOptionData): string {
    const pattern = option.required ? `[${option.name}]` : `<${option.name}>`;
    if (!option.repeat) return pattern;
    return `${pattern.replace(/\%i/g, '1')} ${pattern.replace(/\%i/g, '2')} ...`
  }

  private static getChoiceString(choice: ApplicationCommandOptionChoiceData): string {
    return choice.name === choice.value.toString() ? `\`${choice.name}\`` : `\`${choice.name}\`/\`${choice.value}\``;
  }
}
