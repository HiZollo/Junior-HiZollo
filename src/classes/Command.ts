import { ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { Source } from "./Source";
import { ArgumentParseType, CommandType } from "../utils/enums";
import { CommandOptions, CommandPermission } from "../utils/interfaces";
import { ArgumentParseMethod, HZCommandOptionData } from "../utils/types";

export abstract class Command<T> {
  public type: CommandType;
  public name: string;
  public description: string;
  public extraDescription?: string;
  public aliases?: string[];
  public options?: HZCommandOptionData[];
  public argumentParseMethod: ArgumentParseMethod;
  public cooldown?: number;
  public permissions?: CommandPermission;
  public twoFactorRequired?: boolean;

  public abstract execute(source: Source ,args?: T): Promise<void>;

  constructor(options: CommandOptions) {
    this.type = options.type;
    this.name = options.name;
    this.description = options.description;
    this.extraDescription = options.extraDescription;
    this.aliases = options.aliases;
    this.options = options.options;
    this.argumentParseMethod = options.argumentParseMethod ?? { type: ArgumentParseType.Split, separator: ' ' };
    this.cooldown = options.cooldown;
    this.permissions = options.permissions;
    this.twoFactorRequired = options.twoFactorRequired ?? false;
  }

  public async messageExecute(message: Message<true>, args: T, channel: GuildTextBasedChannel, member: GuildMember): Promise<T> {
    await this.execute(new Source(message, channel, member), args);
    return args;
  }

  public async slashExecute(interaction: ChatInputCommandInteraction<"cached">, args: T, channel: GuildTextBasedChannel, member: GuildMember): Promise<T> {
    await this.execute(new Source(interaction, channel, member), args);
    return args;
  }
}
