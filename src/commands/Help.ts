/*
 * 
 * Copyright 2022, 2026 HiZollo Dev Team <https://github.com/hizollo>
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

import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, InteractionReplyOptions, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import config from "@root/config";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { ArgumentParseType, CommandType } from "../typings/enums";
import { CommandGroup } from "../classes/CommandGroup";
import { Translator } from "../classes/Translator";
import { CommandHelpRenderer } from "../classes/CommandHelpRenderer";

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
      argumentParseMethod: {
        type: ArgumentParseType.None
      },
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
    const command = source.client.commands.search(commandName.trim().split(/\s+/));
    const canViewDeveloper = source.channel.isTestChannel();

    if (!command || !CommandHelpRenderer.isCommandVisible(command, canViewDeveloper)) {
      await source.defer({ ephemeral: true });
      await source.update(`這個指令不存在，請使用 \`${config.bot.prefix}help\` 或 \`/help\` 查看當前的指令列表`);
      return;
    }

    await source.defer();

    if (command instanceof CommandGroup) {
      await source.update(CommandHelpRenderer.getGroupMessage(source, command, canViewDeveloper));
      return;
    }

    const embed = CommandHelpRenderer.getCommandEmbed(source, command);
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

  public getEmbedsForAllTypes(source: Source) {
    const embed = CommandHelpRenderer.createEmbed(source, `以下是我的指令列表，你可以使用 \`${config.bot.prefix}help 指令名稱\` 或 \`/help 指令名稱\` 來查看特定指令的使用方法`);

    let counter = 0;

    for (const type of Object.values(CommandType).filter((t): t is CommandType => typeof t === "number")) {
      if (type === CommandType.Developer) continue;

      embed.addFields({
        name: `🔹 **${Translator.getCommandTypeChinese(type)}**`,
        value: Translator.getCommandTypeChineseDescription(type),
        inline: true
      });

      counter++;

      if (counter % 2 === 1) {
        embed.addFields({
          name: "\u200b",
          value: "\u200b",
          inline: true
        });
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
    const canViewDeveloper = interaction.channel?.isTestChannel() ?? false;

    const options = interaction.client.commands.commands
      .filter(command => command.type === type && CommandHelpRenderer.isCommandVisible(command, canViewDeveloper))
      .map(command => ({
        label: command.name,
        description: command.description,
        emoji: '🔹', 
        value: command.path.join("/")
      }))

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_menu_type')
      .setPlaceholder('請選擇一個指令')
      .setOptions(options)

    return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
  }

  public getEmbedsForType(interaction: StringSelectMenuInteraction<"cached">, type: CommandType) {
    const canViewDeveloper = interaction.channel?.isTestChannel() ?? false;
    const commands = interaction.client.commands.commands
      .filter(command => command.type === type && CommandHelpRenderer.isCommandVisible(command, canViewDeveloper));

    const description =
      `以下是所有**${Translator.getCommandTypeChinese(type)}**分類中的指令\n` +
      `你可以使用 \`${config.bot.prefix}help 指令名稱\` 或 \`/help 指令名稱\` 來查看特定指令的使用方法\n\n` +
      commands.map(command => `\`${command.name}\``).join("．");

    return [CommandHelpRenderer.createEmbed(interaction, description)];
  }
}
