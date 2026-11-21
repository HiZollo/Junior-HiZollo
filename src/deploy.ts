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
import path from "node:path";
import { REST } from "@discordjs/rest";
import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import config from "@root/config";
import constant from "@root/constant.json";
import { Command } from "./classes/Command";
import { CommandGroup } from "./classes/CommandGroup";
import { CommandLoader } from "./classes/CommandLoader";
import { CommandType } from "./typings/enums";
import { HZCommandOptionData } from "./typings/types";
import { Translator } from "./classes/Translator";

(async () => {
  const rest = new REST({ version: '10' }).setToken(config.bot.token);
  const { globalCommands, devCommands } = loadCommands(path.join(__dirname, './commands'));

  try {
    console.log('正在註冊全域指令');
    await rest.put(
      Routes.applicationCommands(config.bot.id), 
      { body: globalCommands }
    );
    console.log('全域指令註冊成功');

    console.log('正在註冊私人指令');
    await rest.put(
      Routes.applicationGuildCommands(config.bot.id, constant.devGuild.id), 
      { body: devCommands }
    );
    console.log('私人指令註冊成功');
  } catch (error) {
    console.error(error);
  }
})();

/**
 * 把指定資料夾裡的指令都轉成 API 看得懂的資料
 * @param dirPath 要讀取的資料夾
 * @returns 
 */
function loadCommands(dirPath: string): {
  globalCommands: RESTPostAPIApplicationCommandsJSONBody[],
  devCommands: RESTPostAPIApplicationCommandsJSONBody[]
} {
  const globalCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  const devCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

  const zGlobalCommands: SlashCommandSubcommandBuilder[] = [];
  const zDevCommands: SlashCommandSubcommandBuilder[] = [];

  const commands = CommandLoader.load(dirPath);

  for (const command of commands.values()) {
    if (!(command instanceof CommandGroup)) {
      const target = command.type === CommandType.Developer ? devCommands : globalCommands;
      target.push(parseCommand(command));
      continue;
    }

    const globalBuilder = createGroupBuilder(command);
    const devBuilder = createGroupBuilder(command);

    let globalExist = false;
    let devExist = false;

    for (const child of command.children.values()) {
      if (child instanceof CommandGroup) {
        const globalGroup = parseNestedGroup(child, "global");
        const devGroup = parseNestedGroup(child, "dev");

        if (globalGroup) {
          globalBuilder.addSubcommandGroup(globalGroup);
          globalExist = true;
        }

        if (devGroup) {
          devBuilder.addSubcommandGroup(devGroup);
          devExist = true;
        }

        continue;
      }

      const shortcut = Translator.getZShortcut(child.path);

      if (child.type === CommandType.Developer) {
        devBuilder.addSubcommand(parseSubcommand(child));
        devExist = true;

        if (shortcut) {
          zDevCommands.push(parseSubcommand(child).setName(shortcut));
        }
      } else {
        globalBuilder.addSubcommand(parseSubcommand(child));
        globalExist = true;

        if (shortcut) {
          zGlobalCommands.push(parseSubcommand(child).setName(shortcut));
        }
      }
    }

    if (globalExist) globalCommands.push(globalBuilder.toJSON());
    if (devExist) devCommands.push(devBuilder.toJSON());
  }

  // 處理 z 指令
  if (zGlobalCommands.length) {
    const builder = new SlashCommandBuilder()
      .setName("z")
      .setDescription("執行 z 指令")
      .setDMPermission(false);

    zGlobalCommands.forEach(command => builder.addSubcommand(command));
    globalCommands.push(builder.toJSON());
  }

  if (zDevCommands.length) {
    const builder = new SlashCommandBuilder()
      .setName("z")
      .setDescription("執行 z 指令")
      .setDMPermission(false);

    zDevCommands.forEach(command => builder.addSubcommand(command));
    devCommands.push(builder.toJSON());
  }

  return { globalCommands, devCommands };
}

function createGroupBuilder(command: CommandGroup): SlashCommandBuilder {
  return new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDMPermission(false);
}

function parseNestedGroup(group: CommandGroup, scope: "global" | "dev"): SlashCommandSubcommandGroupBuilder | null {
  const builder = new SlashCommandSubcommandGroupBuilder()
    .setName(group.name)
    .setDescription(group.description);

  let exists = false;

  for (const command of group.children.values()) {
    if (command instanceof CommandGroup) throw new Error(`Discord Application Command 目前不支援此命令深度：${command.path.join(" ")}`);

    const isDeveloper = command.type === CommandType.Developer;
    if (isDeveloper !== (scope === "dev")) continue;

    builder.addSubcommand(parseSubcommand(command));
    exists = true;
  }

  return exists ? builder : null;
}

/**
 * 把 {@link Command} 轉換成 API 看得懂的資料，這邊用很多 `as` 是因為 discord.js 的型別好像寫爛了
 * @param command 指令本人
 * @returns 
 */
function parseCommand(command: Command): RESTPostAPIApplicationCommandsJSONBody {
  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDMPermission(false);

  if (command.permissions?.user) {
    builder.setDefaultMemberPermissions(command.permissions.user.reduce((acc, cur) => acc | cur, 0n));
  }

  command.options?.forEach(option => addOption(builder, option));
  
  return builder.toJSON();
}

/**
 * 幫 {@link SlashCommandBuilder} 加上一個群組指令
 * @param builder 建築師本人
 * @param command 群組指令本人
 * @returns 群組指令
 */
function parseSubcommand(command: Command): SlashCommandSubcommandBuilder {
  const subcommandbuilder = new SlashCommandSubcommandBuilder()
    .setName(command.name)
    .setDescription(command.description);
  
  command.options?.forEach(option => addOption(subcommandbuilder, option));
  return subcommandbuilder;
}

/**
 * 幫 {@link SlashCommandBuilder} 或 {@link SlashCommandSubcommandBuilder} 加上一個選項
 * @param builder 建築師本人
 * @param option 從 {@link Command} 來的選項
 */
function addOption(builder: SlashCommandBuilder | SlashCommandSubcommandBuilder, option: HZCommandOptionData): void {

  for (let i = 1; i <= (option.repeat ? 5 : 1); i++) {
    const name = option.name.replaceAll('%i', `${i}`);
    const description = option.description.replaceAll('%i', `${i}`);
    switch (option.type) {
      case ApplicationCommandOptionType.Attachment:
        builder.addAttachmentOption(o => o
          .setName(name)
          .setDescription(description)
          .setRequired(!!option.required)
        );
        break;
  
      case ApplicationCommandOptionType.Boolean:
        builder.addBooleanOption(o => o
          .setName(name)
          .setDescription(description)
          .setRequired(!!option.required)
        );
        break;
      
      case ApplicationCommandOptionType.Channel:
        builder.addChannelOption(o => o
          .setName(name)
          .setDescription(description)
          .setRequired(!!option.required)
          .addChannelTypes(...((option.channelTypes ?? []) as ApplicationCommandOptionAllowedChannelTypes[]))
        );
        break;
      
      case ApplicationCommandOptionType.Integer:
        builder.addIntegerOption(o => {
          o.setName(name)
            .setDescription(description)
            .setRequired(!!option.required)
            .setAutocomplete(!!option.autocomplete);
          if ('minValue' in option) {
            if (option.minValue != null) o.setMinValue(option.minValue);
            if (option.maxValue != null) o.setMaxValue(option.maxValue);
          }
          if ('choices' in option) {
            if (option.choices != null) o.setChoices(...(option.choices as { name: string, value: number }[]));
          }
          return o;
        });
        break;
      
      case ApplicationCommandOptionType.Mentionable:
        builder.addMentionableOption(o => o
          .setName(name)
          .setDescription(description)
          .setRequired(!!option.required)
        );
        break;
    
      case ApplicationCommandOptionType.Number:
        builder.addNumberOption(o => {
          o.setName(name)
            .setDescription(description)
            .setRequired(!!option.required)
            .setAutocomplete(!!option.autocomplete);
          if ('minValue' in option) {
            if (option.minValue != null) o.setMinValue(option.minValue);
            if (option.maxValue != null) o.setMaxValue(option.maxValue);
          }
          if ('choices' in option) {
            if (option.choices != null) o.setChoices(...(option.choices as { name: string, value: number }[]));
          }
          return o;
        });
        break;
      
      case ApplicationCommandOptionType.Role:
        builder.addRoleOption(o => o
          .setName(name)
          .setDescription(description)
          .setRequired(!!option.required)
        );
        break;
      
      case ApplicationCommandOptionType.String:
        builder.addStringOption(o => {
          o.setName(name)
            .setDescription(description)
            .setRequired(!!option.required)
            .setAutocomplete(!!option.autocomplete);
          if ('minLength' in option) {
            if (option.minLength != null) o.setMinLength(option.minLength);
            if (option.maxLength != null) o.setMaxLength(option.maxLength);
          }
          if ('choices' in option) {
            if (option.choices != null) o.setChoices(...(option.choices as { name: string, value: string }[]));
          }
          return o;
        });
        break;
    
      case ApplicationCommandOptionType.User:
        builder.addUserOption(o => o
          .setName(name)
          .setDescription(description)
          .setRequired(!!option.required)
        );
        break;
    }
  }
}
