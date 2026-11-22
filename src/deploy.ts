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
import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, Collection, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder } from "discord.js";
import config from "@root/config";
import constant from "@root/constant.json";
import { Command } from "./classes/Command";
import { CommandGroup } from "./classes/CommandGroup";
import { CommandLoader } from "./classes/CommandLoader";
import { CommandType } from "./typings/enums";
import { HZCommandOptionData } from "./typings/types";
import { Translator } from "./classes/Translator";

type CommandScope = "global" | "dev" | "all";

(async () => {
  try {
    const rest = new REST({ version: "10" }).setToken(config.bot.token);
    const guildId = getGuildId();

    // 清空指令
    if (process.argv.includes("--clean")) {
      if (guildId) {
        console.log(`正在清空伺服器指令`);
        await rest.put(
          Routes.applicationGuildCommands(config.bot.id, guildId),
          { body: [] }
        );
        console.log(`已清空伺服器指令`);
      } else {
        console.log("正在清空全域指令");
        await rest.put(
          Routes.applicationCommands(config.bot.id),
          { body: [] }
        );
        console.log("全域指令已清空");
        console.log("正在清空私人指令");
        rest.put(
          Routes.applicationGuildCommands(config.bot.id, constant.devGuild.id),
          { body: [] }
        );
        console.log("已清空私人指令");
      }

      return;
    }

    // 正常部署
    const dirPath = path.join(__dirname, "./commands");
    const commands = CommandLoader.load(dirPath);

    if (guildId) {
      const guildCommands = loadCommands(commands, "all");

      console.log(`正在註冊伺服器指令`);
      await rest.put(
        Routes.applicationGuildCommands(config.bot.id, guildId),
        { body: guildCommands }
      );
      console.log(`伺服器指令註冊成功`);
      return;
    }

    const globalCommands = loadCommands(commands, "global");
    const devCommands = loadCommands(commands, "dev");

    console.log("正在註冊全域指令");
    await rest.put(
      Routes.applicationCommands(config.bot.id),
      { body: globalCommands }
    );
    console.log("全域指令註冊成功");

    console.log("正在註冊私人指令");
    await rest.put(
      Routes.applicationGuildCommands(config.bot.id, constant.devGuild.id),
      { body: devCommands }
    );
    console.log("私人指令註冊成功");
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
})();

/**
 * 尋找 GuildId 參數
 * 支援以下方法
 * npm run deploy -- --guild <guild-id>
 * npm run deploy -- --guild=<guild-id>
 * DEPLOY_GUILD_ID=<guild-id> npm run deploy
 */
function getGuildId(): string | undefined {
  const inlineArgument = process.argv.find(argument => argument.startsWith("--guild="));
  const guildIndex = process.argv.indexOf("--guild");

  const guildId = inlineArgument !== undefined
    ? inlineArgument.slice("--guild=".length)
    : guildIndex !== -1
      ? process.argv[guildIndex + 1]
      : process.env.DEPLOY_GUILD_ID;

  if ((inlineArgument !== undefined || guildIndex !== -1) && !guildId) {
    throw new Error("使用 --guild 時必須提供 Guild ID");
  }

  if (!guildId) return;

  if (!/^\d{17,20}$/.test(guildId)) {
    throw new Error(`無效的 Guild ID：${guildId}`);
  }

  return guildId;
}

/**
 * 把指定資料夾裡的指令都轉成 API 看得懂的資料
 * @param commands 已透過 CommandLoader 載入的指令
 * @param scope 要部署的指令範圍
 * @returns 
 */
function loadCommands(
  commands: Collection<string, Command>,
  scope: CommandScope
): RESTPostAPIApplicationCommandsJSONBody[] {
  const result: RESTPostAPIApplicationCommandsJSONBody[] = [];
  const zCommands: SlashCommandSubcommandBuilder[] = [];

  for (const command of commands.values()) {
    if (!(command instanceof CommandGroup)) {
      if (isCommandInScope(command, scope)) {
        result.push(parseCommand(command));
      }
      continue;
    }

    if (command.options?.length) {
      throw new Error(`指令群組不能設定一般選項：${command.path.join(" ")}`);
    }

    const builder = createCommandBuilder(command);
    let optionCount = 0;

    for (const child of command.children.values()) {
      if (child instanceof CommandGroup) {
        if (!hasCommandsInScope(child, scope)) continue;

        const subcommandGroup = parseSubcommandGroup(child, scope);
        if (!subcommandGroup) continue;

        builder.addSubcommandGroup(subcommandGroup);
      } else {
        if (!isCommandInScope(child, scope)) continue;

        builder.addSubcommand(parseSubcommand(child));
      }

      optionCount++;

      const shortcut = Translator.getZShortcut(child.path);
      if (shortcut) {
        zCommands.push(parseSubcommand(child).setName(shortcut));
      }
    }

    if (!optionCount) continue;
    if (optionCount > 25) throw new Error(`指令 ${command.path.join(' ')} 超過 Discord 的 25 個選項上限`);

    result.push(builder.toJSON());
  }

  // 處理 z 指令
  if (zCommands.length) {
    const builder = new SlashCommandBuilder()
      .setName("z")
      .setDescription("執行 z 指令")
      .setDMPermission(false);

    zCommands.forEach(command => builder.addSubcommand(command));
    result.push(builder.toJSON());
  }

  return result;
}

/**
 * 檢查 {@link Command} 在當下範圍是否可見
 * @param command 指令本人
 * @param 目前可見範圍
 * @returns
 */
function isCommandInScope(command: Command, scope: CommandScope): boolean {
  if (scope === "all") return true;
  return (command.type === CommandType.Developer) === (scope === "dev");
}

/**
 * 檢查 {@link CommandGroup} 在當下範圍是否可見
 * 必須所有子指令都不可見才判定為不可見
 * @param group 群組本人
 * @param 目前可見範圍
 * @returns
 */
function hasCommandsInScope(group: CommandGroup, scope: CommandScope): boolean {
  for (const child of group.children.values()) {
    if (child instanceof CommandGroup) {
      if (hasCommandsInScope(child, scope)) return true;
    } else if (isCommandInScope(child, scope)) {
      return true;
    }
  }

  return false;
}

/**
 * 建立一個基本的 {@link SlashCommandBuilder}，並帶入 {@link Command} 的基本資料
 * 帶入資料為名字、資訊、權限，並將 DMPermission 設為 false
 * @param command 指令本人
 * @returns
 */
function createCommandBuilder(command: Command): SlashCommandBuilder {
  const builder = new SlashCommandBuilder()
    .setName(command.name)
    .setDescription(command.description)
    .setDMPermission(false);

  if (command.permissions?.user) {
    builder.setDefaultMemberPermissions(command.permissions.user.reduce((acc, cur) => acc | cur, 0n));
  }

  return builder;
}

/**
 * 把 {@link Command} 轉換成 API 看得懂的資料
 * @param command 指令本人
 * @returns 
 */
function parseCommand(command: Command): RESTPostAPIApplicationCommandsJSONBody {
  const builder = createCommandBuilder(command);

  command.options?.forEach(option => addOption(builder, option));

  return builder.toJSON();
}


/**
 * 把第二層的 {@link CommandGroup} 轉換成 SubcommandGroup
 * @param group 群組本人
 * @param 目前可見範圍
 * @returns 建立好的 {@link SlashCommandSubcommandBuilder} 或是 null 如果所有子指令都不可見
 */
function parseSubcommandGroup(group: CommandGroup, scope: CommandScope): SlashCommandSubcommandGroupBuilder | null {
  if (group.options?.length) {
    throw new Error(`Discord Application Command 的指令群組不可設定一般選項：${group.path.join(" ")}`);
  }

  const builder = new SlashCommandSubcommandGroupBuilder()
    .setName(group.name)
    .setDescription(group.description);

  let exists = false;

  for (const command of group.children.values()) {
    if (command instanceof CommandGroup) {
      if (hasCommandsInScope(command, scope)) throw new Error(`Discord Application Command 目前不支援此指令群組深度：${command.path.join(" ")}`);
      continue;
    }

    if (!isCommandInScope(command, scope)) continue;

    builder.addSubcommand(parseSubcommand(command));
    exists = true;
  }

  return exists ? builder : null;
}

/**
 * 建立一個群組指令的子指令
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
    const name = option.name.replaceAll("%i", `${i}`);
    const description = option.description.replaceAll("%i", `${i}`);

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
