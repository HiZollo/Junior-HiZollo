import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import { Awaitable, Collection, GuildMFALevel, Interaction, Message, PermissionFlagsBits } from "discord.js";
import { Command } from "./Command";
import { CommandParser } from "./CommandParser";
import { HZClient } from "./HZClient";
import { Source } from "./Source";
import config from '../config';
import missingPermissions from "../features/utils/missingPermissions";
import { CommandManagerRejectReason, CommandParserOptionResultStatus, CommandType } from "../utils/enums";
import { CommandManagerEvents, SubcommandGroup } from "../utils/interfaces";
import { CommandManagerRejectInfo } from "../utils/types";
import { SubcommandManager } from "./SubcommandManager";
import { Translator } from "./Translator";

/**
 * 掌管所有與指令相關的操作，並支援單層的群組指令，必須保證 help 指令存在
 * @extends EventEmitter
 */
export class CommandManager extends EventEmitter {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 一般指令
   */
  public commands: Collection<string, Command>;

  /**
   * 群組指令管家
   */
  public subcommands: SubcommandManager;

  /**
   * 指令是否已載入完畢
   */
  private loaded: boolean;

  /**
   * 建立一個指令管家
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    super();
    this.client = client;
    this.commands = new Collection();
    this.subcommands = new SubcommandManager(client);
    this.loaded = false;
  }

  /**
   * 載入所有指令
   * @param dirPath 要載入的資料夾
   */
  public async load(dirPath: string): Promise<void> {
    if (this.loaded) throw new Error('Commands have already been loaded.');

    const commandFiles = fs.readdirSync(dirPath);
    for (const file of commandFiles) {
      if (!file.endsWith('.js')) continue;

      const C: new () => Command = require(path.join(dirPath, file)).default;
      const instance = new C();

      if (instance.type === CommandType.SubcommandGroup) {
        this.subcommands.load(path.join(dirPath, file.slice(0, -3)), instance);
      }
      else {
        this.commands.set(instance.name, instance);
      }
    }

    this.loaded = true;
    this.emit('loaded');
  }

  /**
   * 轉接第一線的指令互動
   * @param interaction 從 client#on('interactionCreate') 得到的指令互動
   */
  public async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
    if (interaction.user.blocked || interaction.user.bot) return;
    if (this.client.devMode && interaction.channel?.isTestChannel()) return;

    const channel = interaction.channel;
    const member = interaction.member;
    if (!channel || !member) return;

    const commandName: [string, string | undefined] = [interaction.commandName, interaction.options.getSubcommand(false) ?? undefined];
    const command = this.search(commandName);

    // 重新佈署的全域指令有可能因為快取問題而無法使用
    if (!command) {
      this.emit('unavailable', new Source(interaction, channel, member));
      return;
    }

    // 斜線指令不可能會只給群組名稱
    if (!(command instanceof Command)) return;

    if (command.type === CommandType.Developer && !channel.isTestChannel()) return;

    /***** 檢查是否在 HiZollo Network 中使用指令 *****/
    if (interaction.channel.isNetwork()) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.InNetwork, args: [] });
      return;
    }
    /**/

    /***** 檢查 HiZollo 有沒有被該使用者丟到生氣 *****/
    const angryEndtime = await this.client.isAngryAt(interaction.user.id);
    if (angryEndtime > 0) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.Angry, args: [angryEndtime] });
      return;
    }
    /**/

    /***** 檢查執行權限 *****/
    if (command.twoFactorRequired && interaction.guild.mfaLevel === GuildMFALevel.Elevated) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.TwoFactorRequird, args: [] });
      return;
    }

    const userMissing = missingPermissions(command.permissions?.user ?? [], channel, member);
    if (userMissing.length) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.UserMissingPermission, args: [userMissing] });
      return;
    }

    const botMissing = missingPermissions(command.permissions?.bot ?? [], channel, interaction.guild.members.me);
    if (botMissing.length) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.BotMissingPermission, args: [botMissing] });
      return;
    }
    /**/

    /***** 檢查冷卻 *****/
    if (!channel.isTestChannel()) {
      const timeLeft = await this.client.cooldown.checkUser({ commandName: command.name, userId: interaction.user.id });
      if (timeLeft) {
        this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.InCooldown, args: [timeLeft] });
        return;
      }
      this.client.cooldown.addUser({
        commandName: command.name,
        userId: interaction.user.id,
        duration: command.cooldown
      });
    }
    /**/

    /***** 檢查參數 *****/
    const result = await CommandParser.parseSlashArgs(interaction, command);
    if (result.status !== CommandParserOptionResultStatus.Pass) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.IllegalArgument, args: [commandName, command.options ?? [], result] });
      return;
    }
    const args = result.args;
    /**/

    /***** 執行 *****/
    try {
      const source = await command.slashExecute(interaction, args, channel, member);
      this.emit('executed', source, commandName, args);
    } catch (error) {
      this.emit('error', command.name, error as Error);
    }
    /**/
  }

  /**
   * 轉接第一線的訊息
   * @param message 從 client#on('messageCreate') 得到的訊息
   */
  public async onMessageCreate(message: Message): Promise<void> {
    if (!message.inGuild()) return;
    if (message.author.blocked || message.author.bot) return;
    if (message.client.devMode && !message.channel.isTestChannel()) return;
    if (missingPermissions([PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel], message.channel, message.guild.members.me).length) return;

    const channel = message.channel;
    const member = message.member;
    if (!channel || !member) return;


    /********* 一般指令 *********/
    if (!message.content.startsWith(config.bot.prefix)) return;

    const content = message.content.slice(config.bot.prefix.length).trim();
    const [firstArg, secondArg] = content.split(/ +/, 2);
    if (!firstArg) return;

    let commandName: [string, string | undefined] = [firstArg, secondArg];
    let command = message.client.commands.search(commandName);
    if (!command) return;

    let rawArgs = content.slice(firstArg.length).trim();
    if (command instanceof Command) {
      commandName = command.parent ? [command.parent, command.name] : [command.name, undefined];

      const matchingNames = [command.name, ...(command.aliases ?? [])];
      if (!matchingNames.includes(firstArg) && matchingNames.includes(secondArg)) {
        rawArgs = rawArgs.slice(secondArg.length).trim();
      }
    }
    else {
      commandName = ['help', command.name];
      rawArgs = `${command.name} ${rawArgs}`;
      command = message.client.commands.search(commandName) as Command;
    }

    if (command.type === CommandType.Developer && !message.channel.isTestChannel()) return;

    /***** 檢查是否在 HiZollo Network 中使用指令 *****/
    if (message.channel.isNetwork()) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.InNetwork, args: [] });
      return;
    }
    /**/

    /***** 檢查 HiZollo 有沒有被該使用者丟到生氣 *****/
    const angryEndtime = await message.client.isAngryAt(message.author.id);
    if (angryEndtime > 0) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.Angry, args: [angryEndtime] });
      return;
    }
    /**/

    /***** 檢查執行權限 *****/
    if (command.twoFactorRequired && message.guild.mfaLevel === GuildMFALevel.Elevated) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.TwoFactorRequird, args: [] });
    }

    const userMissing = missingPermissions(command.permissions?.user ?? [], message.channel, message.member);
    if (userMissing.length) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.UserMissingPermission, args: [userMissing] });
      return;
    }

    const botMissing = missingPermissions(command.permissions?.bot ?? [], message.channel, message.guild.members.me);
    if (botMissing.length) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.BotMissingPermission, args: [botMissing] });
      return;
    }
    /**/

    /***** 檢查冷卻 *****/
    if (!message.channel.isTestChannel()) {
      const timeLeft = await message.client.cooldown.checkUser({ commandName: command.name, userId: message.author.id });
      if (timeLeft) {
        this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.InCooldown, args: [timeLeft] });
        return;
      }
      message.client.cooldown.addUser({
        userId: message.author.id,
        commandName: command.name,
        duration: command.cooldown
      });
    }
    /**/

    /***** 檢查參數 *****/
    const result = await CommandParser.parseMessageArgs(message, rawArgs, command);
    if (result.status !== CommandParserOptionResultStatus.Pass) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.IllegalArgument, args: [commandName, command.options ?? [], result] });
      return;
    }
    const args = result.args;
    /**/

    /***** 執行 *****/
    try {
      const source = await command.messageExecute(message, args, channel, member);
      this.emit('executed', source, commandName, args);
    } catch (error) {
      this.emit('error', command.name, error as Error);
    }
    /**/
  }

  /**
   * 尋找並回傳指令或指令群，支援群組指令、捷徑用法
   * @param commandName 要搜尋的指令名稱，支援群組指令、捷徑用法
   * @returns 找到的指令或指令群
   */
  public search(commandName: [string, string | undefined]): Command | SubcommandGroup | void {
    let first = commandName[0].toLowerCase();
    let second = commandName[1]?.toLowerCase();

    // 先找 z 指令
    if (first === 'z' && second) {
      const zCommandName = Translator.getCommandName(second);
      if (zCommandName) {
        [first, second] = zCommandName;
      }
    }

    // 一般指令優先
    const command = this.commands.get(first) || this.commands.find(c => !!c.aliases?.includes(first));
    if (command) return command;

    // 群組指令
    return this.subcommands.search([first, second]);
  }

	public each(fn: (value: Command, key: string, collection: Collection<string, Command>) => void): Collection<string, Command> {
		return this.commands.each(fn);
  }

  public map<T>(fn: (value: Command, key: string, collection: Collection<string, Command>) => T): T[] {
		return this.commands.map(fn);
  }


  public on(event: "reject", listener: (source: Source, info: CommandManagerRejectInfo) => Awaitable<void>): this;
  public on<K extends keyof CommandManagerEvents>(event: K, listener: (...args: CommandManagerEvents[K]) => Awaitable<void>): this;
  public on<S extends string | symbol>(event: Exclude<S, keyof CommandManagerEvents | "reject">, listener: (...args: any[]) => Awaitable<void>): this;
  public on(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.on(event, listener);
  }

  public once(event: "reject", listener: (source: Source, info: CommandManagerRejectInfo) => Awaitable<void>): this;
  public once<K extends keyof CommandManagerEvents>(event: K, listener: (...args: CommandManagerEvents[K]) => Awaitable<void>): this;
  public once<S extends string | symbol>(event: Exclude<S, keyof CommandManagerEvents | "reject">, listener: (...args: any[]) => Awaitable<void>): this;
  public once(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.once(event, listener);
  }

  public emit(event: "reject", source: Source, info: CommandManagerRejectInfo): boolean;
  public emit<K extends keyof CommandManagerEvents>(event: K, ...args: CommandManagerEvents[K]): boolean;
  public emit<S extends string | symbol>(event: Exclude<S, keyof CommandManagerEvents | "reject">, ...args: unknown[]): boolean;
  public emit(event: string | symbol, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  public off(event: "reject", listener: (source: Source, info: CommandManagerRejectInfo) => Awaitable<void>): this;
  public off<K extends keyof CommandManagerEvents>(event: K, listener: (...args: CommandManagerEvents[K]) => Awaitable<void>): this;
  public off<S extends string | symbol>(event: Exclude<S, keyof CommandManagerEvents | "reject">, listener: (...args: any[]) => Awaitable<void>): this;
  public off(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.off(event, listener);
  }
}