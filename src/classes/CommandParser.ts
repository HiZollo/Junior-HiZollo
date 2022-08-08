import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionType, Attachment, ChatInputCommandInteraction, Message, MessageMentions } from "discord.js";
import emojiRegex from "emoji-regex";
import { ArgumentParseType, CommandOptionType, CommandParserOptionResultStatus } from "../utils/enums";
import { CommandParserOptionResult, CommandParserResult } from "../utils/types";
import { ArgumentParseMethod, HZCommandOptionData } from "../utils/types";
import { Command } from "./Command";

type parseMessageOptionData = { 
  [key in ApplicationCommandOptionType]: (data: {
    data: HZCommandOptionData, 
    message: Message,
    preParsedArgs: string[], 
    attachments: Attachment[]
  }) => Promise<CommandParserOptionResult> 
}

type parseSlashOptionData = {
  [key in ApplicationCommandOptionType]: (data: {
    interaction: ChatInputCommandInteraction, 
    data: HZCommandOptionData
  }) => Promise<CommandParserOptionResult>
}

export class CommandParser extends null {
  
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
   * 把使用者的輸入訊息轉換成執行指令需要的參數
   * @param message 使用者的輸入訊息
   * @param command 使用者觸發的指令
   * @returns 執行指令需要的參數
   */
  static async parseMessageArgs(message: Message, rawArgs: string, command: Command<unknown>): Promise<CommandParserResult> {
    if (!command.options) {
      return { args: [], status: CommandParserOptionResultStatus.Pass };
    }

    const preParsedArgs = CommandParser.preParseMessageRawArgs(command.argumentParseMethod, rawArgs);
    const attachments = [...message.attachments.values()];

    const args: any = [];
    for (let i = 0; i < command.options.length; i++) {
      do {
        const result: CommandParserOptionResult = await CommandParser.ParseMessageOption[command.options[i].type]({ data: command.options[i], message, preParsedArgs, attachments });
        if (result.status !== CommandParserOptionResultStatus.Pass) {
          return { index: i, ...result };
        }
        args.push(result.arg);
      } while (command.options[i].repeat && preParsedArgs.length);
    }
    return { args, status: CommandParserOptionResultStatus.Pass };
  }


  /**
   * 把使用者的指令互動轉換成執行指令需要的參數
   * @param interaction 使用者的指令互動
   * @param command 使用者觸發的指令
   * @returns 執行指令指令需要的參數
   */
  static async parseSlashArgs(interaction: ChatInputCommandInteraction<"cached">, command: Command<unknown>): Promise<CommandParserResult> {
    if (!command.options) {
      return { args: [], status: CommandParserOptionResultStatus.Pass };
    }

    const args: unknown[] = [];
    for (let i = 0; i < command.options.length; i++) {
      const result: CommandParserOptionResult = await CommandParser.ParseSlashOption[command.options[i].type]({ interaction, data: command.options[i] });
      if (result.status !== CommandParserOptionResultStatus.Pass) {
        return { index: i, ...result };
      }
      args.push(result.arg);
    }
    return { args, status: CommandParserOptionResultStatus.Pass };
  }

  static getChoicesValue(choices: ApplicationCommandOptionChoiceData[], argument: string): string | null {
    return choices.find(c => c.name === argument || c.value.toString() === argument)?.value.toString() ?? null;
  }


  static ParseMessageOption: parseMessageOptionData = {
    async [ApplicationCommandOptionType.Attachment]({ data, attachments }) {
      const argument = attachments.shift() ?? null;
      return { arg: argument, status: CommandParserOptionResultStatus[!argument && data.required ? "Required" : "Pass"] };
    },

    async [ApplicationCommandOptionType.Boolean]({ data, preParsedArgs }) {
      const trues = ['T', 't', 'true', '是', '1'], falses = ['F', 'f', 'false', '否', '0'];
      const original = preParsedArgs.shift();
      const argument = original ?? null;
      if (!argument) {
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
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
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      argument = MessageMentions.ChannelsPattern.test(argument) ? argument.slice(2, -1) : argument;
      const channel = await message.client.channels.fetch(argument).catch(() => {});
      return { arg: channel ?? original, status: CommandParserOptionResultStatus[!channel ? "WrongFormat" : "Pass"] };
    },

    async [ApplicationCommandOptionType.Integer]({ data, preParsedArgs }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if ('choices' in data && data.choices) {
        argument = CommandParser.getChoicesValue(data.choices, argument);
        if (!argument) {
          return { arg: original, status: CommandParserOptionResultStatus.NotInChoices, choices: data.choices };
        }
      }
      const number = Number(argument);
      if (number !== ~~number) {
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

    async [ApplicationCommandOptionType.Mentionable]({ data, preParsedArgs, message }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if (MessageMentions.RolesPattern.test(argument)) {
        const role = await message.guild?.roles.fetch(argument.slice(3, -1)).catch(() => {});
        return { arg: role ?? original, status: CommandParserOptionResultStatus[!role ? "WrongFormat" : "Pass"] };
      }
      if (MessageMentions.UsersPattern.test(argument)) {
        const user = await message.client.users.fetch(argument.slice(2, -1)).catch(() => {});
        return { arg: user ?? original, status: CommandParserOptionResultStatus[!user ? "WrongFormat" : "Pass"] };
      }
      const mentionable = 
        (await message.guild?.roles.fetch(argument).catch(() => {})) ?? 
        (await message.client.users.fetch(argument).catch(() => {}));
      return { arg: mentionable ?? original, status: CommandParserOptionResultStatus[!mentionable ? "WrongFormat" : "Pass"] };
    },

    async [ApplicationCommandOptionType.Number]({ data, preParsedArgs }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
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
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }

      if (MessageMentions.RolesPattern.test(argument)) {
        argument = argument.slice(3, -1);
      }
      const role = await message.guild?.roles.fetch(argument).catch(() => {});
      return { arg: role ?? original, status: CommandParserOptionResultStatus[!role ? "WrongFormat" : "Pass"] };
    },

    async [ApplicationCommandOptionType.String]({ data, preParsedArgs }) {
      const original = preParsedArgs.shift();
      let argument = original ?? null;
      if (!argument) {
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
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
        return { arg: original, status: CommandParserOptionResultStatus[data.required ? "Required" : "Pass"] };
      }
      
      if (MessageMentions.UsersPattern.test(argument)) {
        argument = argument.slice(2, -1);
      }
      if (data.parseAs === CommandOptionType.Member) {
        const member = await message.guild?.members.fetch(argument).catch(() => {});
        return { arg: member ?? original, status: CommandParserOptionResultStatus[!member ? "WrongFormat" : "Pass"] };
      }
      const user = await message.client.users.fetch(argument).catch(() => {});
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


  static ParseSlashOption: parseSlashOptionData = {
    async [ApplicationCommandOptionType.Attachment]({ interaction, data }) {
      const argument = interaction.options.getAttachment(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Boolean]({ interaction, data }) {
      const argument = interaction.options.getBoolean(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Channel]({ interaction, data }) {
      const argument = interaction.options.getChannel(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Integer]({ interaction, data }) {
      const argument = interaction.options.getInteger(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Mentionable]({ interaction, data }) {
      const argument = interaction.options.getMentionable(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Number]({ interaction, data }) {
      const argument = interaction.options.getNumber(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.Role]({ interaction, data }) {
      const argument = interaction.options.getRole(data.name);
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.String]({ interaction, data }) {
      const argument = interaction.options.getString(data.name);
      if (argument === null) {
        return { arg: null, status: CommandParserOptionResultStatus.Pass };
      }
      if (data.parseAs === CommandOptionType.Emoji && !emojiRegex().test(argument) && !/<?(a)?:?(\w{2,32}):(\d{17,19})>?/.test(argument)) {
        return { arg: null, status: CommandParserOptionResultStatus.WrongFormat };
      }
      return { arg: argument, status: CommandParserOptionResultStatus.Pass };
    },

    async [ApplicationCommandOptionType.User]({ interaction, data }) {
      const argument = interaction.options.getUser(data.name) ?? null;
      if (argument === null) {
        return { arg: null, status: CommandParserOptionResultStatus.Pass };
      }
      if (data.parseAs === CommandOptionType.Member) {
        const member = interaction.guild?.members.resolve(argument.id) ?? null;
        return { arg: member, status: CommandParserOptionResultStatus[!member ? "WrongFormat" : "Pass"] };
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