/*
 *
 * Copyright 2026 HiZollo Dev Team <https://github.com/hizollo>
 *
 * This file is a part of Junior HiZollo.
 *
 * Junior HiZollo is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Junior HiZollo is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { ActionRowBuilder, ApplicationCommandOptionChoiceData, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { Command } from "./Command";
import type { Source } from "./Source";
import { HZCommandOptionData } from "../typings/types";
import { Translator } from "./Translator";
import { CommandGroup } from "./CommandGroup";
import { CommandType } from "../typings/enums";

type HelpSource = Pick<Source, 'client' | 'member'>

export class CommandHelpRenderer extends null {
  /**
   * 建立共用的 Help Embed 外觀
   */
  static createEmbed(source: HelpSource, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder()
      .applyHiZolloSettings(source.member, "HiZollo 的幫助中心", "使用指令時不須連同 [] 或 <> 一起輸入")
      .setThumbnail(source.client.user?.displayAvatarURL({ extension: "png", size: 2048 }) ?? null);

    if (!description) return embed

    embed.setDescription(description);
    return embed;
  }

  /**
   * 建立指定群組的指令列表 Embed
   */
  static getGroupEmbed(source: HelpSource, command: CommandGroup, canViewDeveloper = false): EmbedBuilder {
    const groupName = command.path.join(" ");
    const hasVisibleCommands = [...command.children.values()].some(child => this.isCommandVisible(child, canViewDeveloper));
    const description = [
      `**${groupName}**`,
      command.description,
      hasVisibleCommands ? "請從下方選單選擇要查看的指令。" : "此群組目前沒有可用指令。"
    ].join("\n\n");

    return this.createEmbed(source, description);
  }

  /**
   * 建立單一指令的詳細說明 Embed
   */
  static getCommandEmbed(source: HelpSource, command: Command): EmbedBuilder {
    return this.createEmbed(source, this.getDescriptionForCommand(command));
  }

  /**
   * 取得指令的詳細說明文字
   */
  static getDescriptionForCommand(command: Command): string {
    let description = `\`${command.path.join(' ')}\`\n${command.description}\n`;
    if (command.extraDescription) description += `${command.extraDescription}\n`;
    description += "\n";
    if (command.aliases) description += `** - 替代名稱：**${command.aliases.map(a => `\`${a}\``).join(", ")}\n`;
    if (command.type) description += `** - 分類位置：**${Translator.getCommandTypeChinese(command.type)}\n`;
    if (command.options) description += `** - 指令參數：**${this.optionsToString(command.options)}`;
    if (command.cooldown) description += `** - 冷卻時間：**${command.cooldown} 秒\n`;
    return description;
  }

  private static optionsToString(options: HZCommandOptionData[]): string {
    let description = '';
    description += `\`${options.map(option => this.getOptionNameString(option)).join(" ")}\`\n`;
    for (const option of options) {
      description += ` \`${this.getOptionNameString(option)}\`\n`;
      description += `　- 選項說明：${option.description}\n`;
      description += `　- 規範型別：${Translator.getCommandOptionTypeChinese(option)}\n`;
      if ('choices' in option && option.choices) {
        description += `　- 規範選項：${option.choices.map(choice => this.getChoiceString(choice)).join("．")}\n`;
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
    return `${pattern.replace(/\%i/g, '1')} ${pattern.replace(/\%i/g, '2')} ...`;
  }

  private static getChoiceString(choice: ApplicationCommandOptionChoiceData): string {
    return choice.name === choice.value.toString() ? `\`${choice.name}\`` : `\`${choice.name}\`/\`${choice.value}\``;
  }

  public static getGroupMessage(source: HelpSource, command: CommandGroup, canViewDeveloper = false) {
    return {
      embeds: [this.getGroupEmbed(source, command, canViewDeveloper)],
      components: this.getGroupComponents(command, canViewDeveloper)
    };
  }

  public static getGroupComponents(command: CommandGroup, canViewDeveloper = false): ActionRowBuilder<StringSelectMenuBuilder>[] {
    const children = [...command.children.values()].filter(child => this.isCommandVisible(child, canViewDeveloper));
    if (!children.length) return [];

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`help_menu_group`)
      .setPlaceholder("請選擇一個指令");

    for (const child of children) {
      menu.addOptions({
        label: child.name,
        description: child.description.slice(0, 100),
        emoji: "🔹",
        value: child.path.join("/")
      });
    }

    return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
  }

  /**
   * 判斷指令是否可以在目前環境中顯示
   *
   * 開發者指令只會在測試頻道中顯示。
   * 群組指令只顯示可見的子指令，如果完全沒有則隱藏。
   */
  public static isCommandVisible(command: Command, canViewDeveloper: boolean): boolean {
    if (command instanceof CommandGroup) return [...command.children.values()].some(child => this.isCommandVisible(child, canViewDeveloper));
    return command.type !== CommandType.Developer || canViewDeveloper;
  }
}
