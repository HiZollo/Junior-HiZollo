import { ChatInputCommandInteraction, GuildMember, GuildTextBasedChannel, Message } from "discord.js";
import { Source } from "./Source";
import { ArgumentParseType, CommandType } from "../utils/enums";
import { CommandOptions, CommandPermission } from "../utils/interfaces";
import { ArgumentParseMethod, HZCommandOptionData } from "../utils/types";

/**
 * 一個指令的藍圖
 * @abstract
 */
export abstract class Command<T> {
  /**
   * 指令的分類
   */
  public type: CommandType;

  /**
   * 指令的父指令
   */
  public parent: string | null;

  /**
   * 指令名稱
   */
  public name: string;

  /**
   * 指令描述
   */
  public description: string;

  /**
   * 指令的額外描述
   */
  public extraDescription?: string;

  /**
   * 指令的替代用法
   */
  public aliases?: string[];

  /**
   * 指令的選項
   */
  public options?: HZCommandOptionData[];

  /**
   * 訊息指令中解析訊息內容的方法
   */
  public argumentParseMethod: ArgumentParseMethod;

  /**
   * 指令的冷卻時間
   */
  public cooldown?: number;

  /**
   * 執行指令所需的權限
   */
  public permissions?: CommandPermission;

  /**
   * 是否需要 2FA 驗證才能執行指令
   */
  public twoFactorRequired?: boolean;

  /**
   * 執行此指令
   * @param source 觸發指令的來源
   * @param args 指令的參數
   * @abstract
   */
  public abstract execute(source: Source ,args?: T): Promise<void>;

  /**
   * 建立一個指令
   * @param options 
   */
  constructor(options: CommandOptions) {
    this.type = options.type;
    this.parent = options.parent ?? null;
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

  /**
   * 執行訊息指令
   * @param message 來源訊息
   * @param args 指令的參數
   * @param channel 來源頻道
   * @param member 觸發指令的成員
   * @returns 來源訊息
   */
  public async messageExecute(message: Message<true>, args: T, channel: GuildTextBasedChannel, member: GuildMember): Promise<Source<Message<true>>> {
    const source = new Source(message, channel, member);
    await this.execute(source, args);
    return source;
  }

  /**
   * 執行斜線指令
   * @param interaction 來源互動
   * @param args 指令的參數
   * @param channel 來源頻道
   * @param member 觸發指令的成員
   * @returns 來源互動
   */
  public async slashExecute(interaction: ChatInputCommandInteraction<"cached">, args: T, channel: GuildTextBasedChannel, member: GuildMember): Promise<Source<ChatInputCommandInteraction<"cached">>> {
    const source = new Source(interaction, channel, member);
    await this.execute(source, args);
    return source;
  }
}
