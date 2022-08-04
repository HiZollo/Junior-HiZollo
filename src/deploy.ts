import fs from "fs";
import path from "path";
import { REST } from "@discordjs/rest";
import { ApplicationCommandOptionAllowedChannelTypes, ApplicationCommandOptionType, RESTPostAPIApplicationCommandsJSONBody, Routes, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import config from "./config";
import constant from "./constant.json";
import { Command } from "./classes/Command";
import { CommandType } from "./utils/enums";
import { HZCommandOptionData } from "./utils/types";

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
  const commandFiles = fs.readdirSync(dirPath);

  for (const file of commandFiles) {
    const filePath = path.join(dirPath, file);
  
    // 如果是資料夾就是群組指令
    if (fs.statSync(filePath).isDirectory()) {
      const globalBuilder = new SlashCommandBuilder()
        .setName(file.toLocaleLowerCase())
        .setDescription(`執行 ${file.toLocaleLowerCase()} 群組指令`)
        .setDMPermission(false);
      const devBuilder = new SlashCommandBuilder()
        .setName(file.toLocaleLowerCase())
        .setDescription(`執行 ${file.toLocaleLowerCase()} 群組指令`)
        .setDMPermission(false);
      let globalExist = false, devExist = false;
  
      const subcommandFiles = fs.readdirSync(filePath);
      for (const subcommandFile of subcommandFiles) {
        if (!subcommandFile.endsWith('.js')) continue;
        
        const C: new () => Command<unknown> = require(path.join(filePath, subcommandFile)).default;
        const subcommand = new C();
  
        addSubcommand(subcommand.type === CommandType.Developer ? devBuilder : globalBuilder, subcommand);
        globalExist ||= subcommand.type !== CommandType.Developer;
        devExist ||= subcommand.type === CommandType.Developer;
      }
  
      if (globalExist) globalCommands.push(globalBuilder.toJSON());
      if (devExist) devCommands.push(devBuilder.toJSON());
    }
  
    // 其他就是一般指令
    else if (file.endsWith('.js')) {
      const C: new () => Command<unknown> = require(filePath).default;
      const command = new C();
  
      (command.type === CommandType.Developer ? devCommands : globalCommands).push(parseCommand(command));
    }
  }

  return { globalCommands, devCommands };
}

/**
 * 把 {@link Command} 轉換成 API 看得懂的資料，這邊用很多 `as` 是因為 discord.js 的型別好像寫爛了
 * @param command 指令本人
 * @returns 
 */
function parseCommand(command: Command<unknown>): RESTPostAPIApplicationCommandsJSONBody {
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
 */
function addSubcommand(builder: SlashCommandBuilder, command: Command<unknown>): void {
  const subcommandbuilder = new SlashCommandSubcommandBuilder()
    .setName(command.name)
    .setDescription(command.description);
  
  command.options?.forEach(option => addOption(subcommandbuilder, option));
  builder.addSubcommand(subcommandbuilder);
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
            if (option.maxValue != null) o.setMinValue(option.maxValue);
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
            if (option.maxValue != null) o.setMinValue(option.maxValue);
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
            if (option.maxLength != null) o.setMinLength(option.maxLength);
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