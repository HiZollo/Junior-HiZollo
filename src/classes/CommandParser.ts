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

import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, Attachment, ChatInputCommandInteraction, Message, MessageMentions } from "discord.js";
import emojiRegex from "emoji-regex";
import { ArgumentParseType, CommandOptionType, CommandParserOptionResultStatus } from "../typings/enums";
import { CommandParserOptionResult, CommandParserResult } from "../typings/types";
import { ArgumentParseMethod, HZCommandOptionData } from "../typings/types";
import { Command } from "./Command";

type ParseMessageOptionFunctions = {
  [key in ApplicationCommandOptionType]: (data: {
    data: HZCommandOptionData,
    message: Message,
    preParsedArgs: string[],
    attachments: Attachment[]
  }) => Promise<CommandParserOptionResult>
}

type ParseSlashOptionFunctions = {
  [key in ApplicationCommandOptionType]: (data: {
    interaction: ChatInputCommandInteraction,
    data: HZCommandOptionData,
    optionName?: string
  }) => Promise<CommandParserOptionResult>
}

/**
 * 將斜線指令或訊息解析成指定格式的解析器
 * @extends null
 */
export class CommandParser extends null {
  /**
   * 把原訊息內容預處理成參數陣列
   * @param method 拆分參數的方法
   * @param rawArgs 除去指令前綴與指令名稱的訊息內容
   * @returns 解析後的陣列
   */
  static preParseMessageRawArgs(method: ArgumentParseMethod, rawArgs: string): string[] {
    if (!rawArgs.length) return [];
    switch (method.type) {
      case ArgumentParseType.None:
        return [rawArgs];

      case ArgumentParseType.Split:
        const { separator } = method;
        return rawArgs.split(new RegExp(`(?:${separator})+`));

      case ArgumentParseType.Quote:
        const [left, right] = method.quotes;
        return rawArgs.match(new RegExp(`(?<=${left})[\\s\\S]*?(?=${right})`, 'g'))?.filter((_s, i) => ~i & 1) ?? [];

      case ArgumentParseType.Custom:
        return method.func(rawArgs);
    }
  }


  /**
   * 把使用者的輸入訊息解析成執行指令需要的參數，如果過程中有任何不合法的參數會直接中斷解析，並回傳不合法的原因
   * @param message 使用者的輸入訊息
   * @param command 使用者觸發的指令
   * @returns 解析結果
   */
  static async parseMessageArgs(message: Message, rawArgs: string, command: Command): Promise<CommandParserResult> {
    if (!command.options) {
      return { args: [], status: CommandParserOptionResultStatus.Pass };
    }

    const preParsedArgs = CommandParser.preParseMessageRawArgs(command.argumentParseMethod, rawArgs);
    const attachments = [...message.attachments.values()];

    const args: any = [];
    for (let i = 0; i < command.options.length; i++) {
      do {
        const result: CommandParserOptionResult = await CommandParser.ParseMessageOption[command.options[i].type]({
          data: command.options[i],
          message,
          preParsedArgs,
          attachments
        });

        if (result.status !== CommandParserOptionResultStatus.Pass) {
          return { index: i, ...result };
        }
        args.push(result.arg);
      } while (command.options[i].repeat && preParsedArgs.length);
    }
    return { args, status: CommandParserOptionResultStatus.Pass };
  }


  /**
   * 把使用者的指令互動解析成執行指令需要的參數，如果過程中有任何不合法的參數會直接中斷解析，並回傳不合法的原因
   * @param interaction 使用者的指令互動
   * @param command 使用者觸發的指令
   * @returns 解析結果
   */
  static async parseSlashArgs(interaction: ChatInputCommandInteraction<"cached">, command: Command): Promise<CommandParserResult> {
    if (!command.options) {
      return { args: [], status: CommandParserOptionResultStatus.Pass };
    }

    const args: unknown[] = [];
    for (let i = 0; i < command.options.length; i++) {
      let repeatIndex = 1;
      do {
        const result: CommandParserOptionResult = await CommandParser.ParseSlashOption[command.options[i].type]({
          interaction,
          data: command.options[i],
          optionName: command.options[i].name.replaceAll('%i', repeatIndex.toString())
        });

        if (result.status !== CommandParserOptionResultStatus.Pass) {
          return { index: i, ...result };
        }
        args.push(result.arg);
      } while (command.options[i].repeat && repeatIndex++ < 5);
    }
    return { args, status: CommandParserOptionResultStatus.Pass };
  }

  /**
   * [訊息指令專用] 判斷使用者輸入是否在給定的選項內，如果是，就回傳對應選項的 value
   * @param choices 給定的選項
   * @param argument 使用者輸入
   * @returns 對應選項的 value
   */
  static getChoicesValue(choices: readonly ApplicationCommandOptionChoiceData[], argument: string): string | null {
    return choices.find(c => c.name === argument || c.value.toString() === argument)?.value.toString() ?? null;
  }

  /**
   * 解析訊息指令的一個選項，並回傳解析結果
   * 
   * @example
   * CommandParser.ParseMessageOption[ApplicationCommandOptionType.Boolean]({ data, preParsedArgs });
   * 
   * 要先在 [] 裡面指定參數型別，再把選項傳進函式裡，如果參數型別給了 Subcommand 或 SubcommandGroup 則會報錯。
   * 注意這個函式會執行一次 preParsedArgs.shift()（當參數型別是 Attachment 時則會執行 attachments.shift()），因此傳入的陣列會被改動 
   */
  static ParseMessageOption: ParseMessageOptionFunctions = {
    async [ApplicationCommandOptionType.Attachment]({ data, attachments }) {
      const argument = attachments.shift() ?? null;
      return { arg: null, status: CommandParserOptionResultStatus[!argument && data.required ? "Required" : "Pass"] };
    },

    async [ApplicationCommandOptionType.Boolean]({ data, preParsedArgs }) {
      const trues = ['T', 't', 'true', '是', '1'], falses = ['F', 'f', 'false', '否', '0'];
      const original = preParsedArgs.shift();
      const argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if (trues.includes(argument)) {
        return { arg: true, status: CommandParserOptionResultStatus.Pass };
      }
      if (falses.includes(argument)) {
        return { arg: false, status: CommandParserOptionResultStatus.Pass };
      }
      return { arg: original, status: CommandParserOptionResultStatus.WrongFormat };
    },

    async [ApplicationCommandOptionType.Channel]({ data, preParsedArgs, message }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      argument = MessageMentions.ChannelsPattern.test(argument) ? argument.slice(2, -1) : argument;
      const channel = await message.client.channels.fetch(argument).catch(() => { });
      return { arg: channel ?? original, status: CommandParserOptionResultStatus[!channel ? "WrongFormat" : "Pass"] };
    },

    async [ApplicationCommandOptionType.Integer]({ data, preParsedArgs }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if ('choices' in data && data.choices) {
        argument = CommandParser.getChoicesValue(data.choices, argument);
        if (!argument) {
          return { arg: original, status: CommandParserOptionResultStatus.NotInChoices, choices: data.choices };
        }
      }

      let number: bigint;
      try {
        number = BigInt(argument);
      } catch {
        return { arg: argument, status: CommandParserOptionResultStatus.WrongFormat };
      }

      if ('minValue' in data) {
        if (data.minValue && number < data.minValue) {
          return { arg: original, status: CommandParserOptionResultStatus.ValueTooSmall, limit: data.minValue };
        }
        if (data.maxValue && data.maxValue < number) {
          return { arg: original, status: CommandParserOptionResultStatus.ValueTooLarge, limit: data.maxValue };
        }
      }
      return { arg: Number(number), status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Mentionable]({ data, preParsedArgs, message }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if (MessageMentions.RolesPattern.test(argument)) {
        const role = await message.guild?.roles.fetch(argument.slice(3, -1)).catch(() => { });
        return { arg: role ?? original, status: CommandParserOptionResultStatus[!role ? "WrongFormat" : "Pass"] };
      }
      if (MessageMentions.UsersPattern.test(argument)) {
        const user = await message.client.users.fetch(argument.slice(2, -1)).catch(() => { });
        return { arg: user ?? original, status: CommandParserOptionResultStatus[!user ? "WrongFormat" : "Pass"] };
      }
      const mentionable =
        (await message.guild?.roles.fetch(argument).catch(() => { })) ??
        (await message.client.users.fetch(argument).catch(() => { }));
      return { arg: mentionable ?? original, status: CommandParserOptionResultStatus[!mentionable ? "WrongFormat" : "Pass"] };
    },

    async [ApplicationCommandOptionType.Number]({ data, preParsedArgs }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if ('choices' in data && data.choices) {
        argument = CommandParser.getChoicesValue(data.choices, argument);
        if (!argument) {
          return { arg: original, status: CommandParserOptionResultStatus.NotInChoices, choices: data.choices };
        }
      }
      const number = Number(argument);
      if (isNaN(number)) {
        return { arg: argument, status: CommandParserOptionResultStatus.WrongFormat };
      }
      if ('minValue' in data) {
        if (data.minValue && number < data.minValue) {
          return { arg: original, status: CommandParserOptionResultStatus.ValueTooSmall, limit: data.minValue };
        }
        if (data.maxValue && data.maxValue < number) {
          return { arg: original, status: CommandParserOptionResultStatus.ValueTooLarge, limit: data.maxValue };
        }
      }
      return { arg: number, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Role]({ data, preParsedArgs, message }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if (MessageMentions.RolesPattern.test(argument)) {
        argument = argument.slice(3, -1);
      }
      const role = await message.guild?.roles.fetch(argument).catch(() => { });
      return { arg: role ?? original, status: CommandParserOptionResultStatus[!role ? "WrongFormat" : "Pass"] };
    },

    async [ApplicationCommandOptionType.String]({ data, preParsedArgs }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if ('choices' in data && data.choices) {
        argument = CommandParser.getChoicesValue(data.choices, argument);
        if (!argument) {
          return { arg: original, status: CommandParserOptionResultStatus.NotInChoices, choices: data.choices };
        }
      }
      if (data.parseAs === CommandOptionType.Emoji && !emojiRegex().test(argument) && !/<?(a)?:?(\w{2,32}):(\d{17,20})>?/.test(argument)) {
        return { arg: original, status: CommandParserOptionResultStatus.WrongFormat };
      }
      if ('minLength' in data) {
        if (data.minLength && argument.length < data.minLength) {
          return { arg: original, status: CommandParserOptionResultStatus.LengthTooShort, limit: data.minLength };
        }
        if (data.maxLength && data.maxLength < argument.length) {
          return { arg: original, status: CommandParserOptionResultStatus.LengthTooLong, limit: data.maxLength };
        }
      }
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.User]({ data, preParsedArgs, message }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: null, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if (MessageMentions.UsersPattern.test(argument)) {
        argument = argument.slice(2, -1);
      }
      if (data.parseAs === CommandOptionType.Member) {
        const member = await message.guild?.members.fetch(argument).catch(() => { });
        return { arg: member ?? original, status: CommandParserOptionResultStatus[!member ? "WrongFormat" : "Pass"] };
      }
      const user = await message.client.users.fetch(argument).catch(() => { });
      return { arg: user ?? original, status: CommandParserOptionResultStatus[!user ? "WrongFormat" : "Pass"] };
    },


    // 這裡也許永遠不會執行到，很想拿掉但我需要讓編譯器閉嘴
    async [ApplicationCommandOptionType.Subcommand]() {
      throw new Error('Subcommands cannot be parsed');
    },
    async [ApplicationCommandOptionType.SubcommandGroup]() {
      throw new Error('SubcommandGroups cannot be parsed');
    }
  };

  /**
   * 解析斜線指令的一個選項，並回傳解析結果
   * 
   * @example
   * CommandParser.ParseSlashOption[ApplicationCommandOptionType.Boolean]({ interaction, data, optionName });
   * 
   * 要先在 [] 裡面指定參數型別，再把選項傳進函式裡，如果參數型別給了 `Subcommand` 或 `SubcommandGroup` 則會報錯。
   */
  static ParseSlashOption: ParseSlashOptionFunctions = {
    async [ApplicationCommandOptionType.Attachment]({ interaction, data, optionName }) {
      const argument = interaction.options.getAttachment(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Boolean]({ interaction, data, optionName }) {
      const argument = interaction.options.getBoolean(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Channel]({ interaction, data, optionName }) {
      const argument = interaction.options.getChannel(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Integer]({ interaction, data, optionName }) {
      const argument = interaction.options.getInteger(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Mentionable]({ interaction, data, optionName }) {
      const argument = interaction.options.getMentionable(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Number]({ interaction, data, optionName }) {
      const argument = interaction.options.getNumber(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Role]({ interaction, data, optionName }) {
      const argument = interaction.options.getRole(optionName ?? data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.String]({ interaction, data, optionName }) {
      const argument = interaction.options.getString(optionName ?? data.name);
      if (argument === null) {
        return { arg: null, status: CommandParserOptionResultStatus.Pass };
      }
      if (data.parseAs === CommandOptionType.Emoji && !emojiRegex().test(argument) && !/<?(a)?:?(\w{2,32}):(\d{17,19})>?/.test(argument) && !/[🇦-🇿]/u.test(argument)) {
        return { arg: null, status: CommandParserOptionResultStatus.WrongFormat };
      }
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.User]({ interaction, data, optionName }) {
      const argument = interaction.options.getUser(optionName ?? data.name) ?? null;
      if (argument === null) {
        return { arg: argument, status: CommandParserOptionResultStatus.Pass };
      }
      if (data.parseAs === CommandOptionType.Member) {
        const member = interaction.guild?.members.resolve(argument.id) ?? null;
        return { arg: member ?? argument, status: CommandParserOptionResultStatus[!member ? "WrongFormat" : "Pass"] };
      }
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },


    // 這裡也許永遠不會執行到，很想拿掉但我需要讓編譯器閉嘴
    async [ApplicationCommandOptionType.Subcommand]() {
      throw new Error('Subcommands cannot be parsed');
    },
    async [ApplicationCommandOptionType.SubcommandGroup]() {
      throw new Error('SubcommandGroups cannot be parsed');
    }
  };
}
