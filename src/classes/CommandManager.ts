import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import { Awaitable, Collection, GuildMFALevel, Interaction, Message, PermissionFlagsBits } from "discord.js";
import { Command } from "./Command";
import { CommandParser } from "./CommandParser";
import { HZClient } from "./HZClient";
import { Source } from "./Source";
import config from '../config';
import missingPermissions from "../features/utils/missingPermissions";
import { CommandManagerRejectReason, CommandParserOptionResultStatus, CommandType } from "../utils/enums";
import { CommandManagerEvents } from "../utils/interfaces";
import { CommandManagerRejectInfo } from "../utils/types";

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
  public commands: Collection<string, Command<unknown>>;

  /**
   * 群組指令
   */
  public subcommands: Collection<string, Collection<string, Command<unknown>>>;

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
    this.subcommands = new Collection();
    this.loaded = false;
  }

  /**
   * 載入所有指令
   * @param dirPath 要載入的資料夾
   */
  public async load(dirPath: string): Promise<void> {
    if (this.loaded) throw new Error('Commands have already been loaded.');

    const applicationCommands = await this.client.application?.commands.fetch().catch(console.log);
    if (!applicationCommands) throw new Error('Falied to fetch application commands.');

    const commandFiles = fs.readdirSync(dirPath);
    for (const file of commandFiles) {
      const filePath = path.join(dirPath, file);

      // 如果是資料夾就是群組指令
      if (fs.statSync(filePath).isDirectory()) {
        const subcommandFiles = fs.readdirSync(dirPath);
        const group = new Collection<string, Command<unknown>>();
    
        for (const subcommandFile of subcommandFiles) {
          if (!subcommandFile.endsWith('.js')) continue;
          
          const C: new () => Command<unknown> = require(path.join(dirPath, subcommandFile)).default;
          const instance = new C();
    
          group.set(instance.name, instance);
        }
    
        this.subcommands.set(file.toLowerCase(), group);
      }

      // 其他就是一般指令
      else if (file.endsWith('.js')) {
        const C: new () => Command<unknown> = require(filePath).default;
        const instance = new C();
        this.commands.set(instance.name, instance);
      }
    }

    this.loaded = true;
    this.emit('loaded');
  }

  /**
   * 把第一線的指令互動轉接給各指令類別執行
   * @param interaction 從 client#on('interactionCreate') 得到的指令互動
   */
  public async interactionRun(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
    if (interaction.user.blocked || interaction.user.bot) return;
    if (this.client.devMode && interaction.channel?.isTestChannel()) return;

    const channel = interaction.channel;
    const member = interaction.member;
    if (!channel || !member) return;

    const command = this.search([
      interaction.commandName, 
      interaction.options.getSubcommand(false) ?? undefined
    ]);

    // /********* 搜尋指令 *********/
    // let groupName, commandName; // 群組指令名稱（如有）與將執行的指令名稱
    // let command, data; // 指令與其參數
    // let shortcut = false;

    // // 捷徑用法
    // if (interaction.commandName === 'z') {
    //   shortcut = true;
    //   data = interaction.options.data;
    //   [groupName, commandName] = Z.getValueByKey(data[0].name).split('_');
    //   command = this.client.commands.get(groupName).get(commandName);
    //   data = data[0].options || [];
    // }

    // 重新佈署的全域指令有可能因為快取問題而無法使用
    if (!command) {
      this.emit('unavailable', new Source(interaction, channel, member));
      return;
    }

    // 斜線指令不可能會只給群組名稱
    if (command instanceof Collection) return;

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
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.IllegalArgument, args: [command.options ?? [], result] });
      return;
    }
    const args = result.args;
    /**/

    /***** 執行 *****/
    try {
      await command.slashExecute(interaction, args, channel, member);
      this.emit('executed', command.name, args);
    } catch (error) {
      this.emit('error', command.name, error);
    }
    /**/
  }


  /**
   * 把第一線的訊息轉接給各指令類別執行
   * @param message 從 client#on('messageCreate') 得到的訊息
   */
  public async messageRun(message: Message): Promise<void> {
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
    const [, firstArg, spaces, secondArg] = content.match(/^(\S+)(\s*)(\S+)?/) ?? [];
    if (!firstArg) return;

    let commandName: [string, string | undefined] = [firstArg, secondArg];
    let command = message.client.commands.search(commandName);
    let rawArgs = content.slice(firstArg.length + (command instanceof Command && ![command.name, ...(command.aliases ?? [])].includes(firstArg) && [command.name, ...(command.aliases ?? [])].includes(secondArg) ? (spaces + secondArg).length : 0)).trim();
    if (!command) return;

    // 只給群組名稱就當成使用 help firstArg
    if (command instanceof Collection) {
      commandName = ['help', firstArg];
      command = message.client.commands.search(commandName) as Command<unknown>;
      rawArgs = `${firstArg} ${rawArgs}`;
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
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.IllegalArgument, args: [command.options ?? [], result] });
      return;
    }
    const args = result.args;
    /**/

    /***** 執行 *****/
    try {
      await command.messageExecute(message, args, channel, member);
      this.emit('executed', command.name, args);
    } catch (error) {
      this.emit('error', command.name, error);
    }
    /**/
  }

  /**
   * 尋找指令
   * @param commandName first 是第一個參數，second 是第二個參數
   * @returns 
   */
  public search(commandName: [string, string | undefined]): Command<unknown> | Collection<string, Command<unknown>> | void {
    const first = commandName[0].toLowerCase();
    const second = commandName[1]?.toLowerCase();

    // 先找 z 指令，這個只有斜線指令才會出現
    if (first === 'z') {

    }

    // 沒有第二個參數代表只有一層
    if (second === undefined) {
      // 先找一般指令
      const command: Command<unknown> | Collection<string, Command<unknown>> | undefined = 
        this.commands.get(first) ||
        this.commands.find(c => !!c.aliases?.includes(first));
      if (command) return command;

      // 再找群組指令
      const group = this.subcommands.get(first);
      if (group) return group;

      // 再找捷徑用法，假設沒有 collision
      return this.subcommands.map(group => group.get(first) || group.find(c => !!c.aliases?.includes(first))).find(c => c);
    }

    // 一般指令 + 參數
    const command = this.commands.get(first) ||
      this.commands.find(c => !!c.aliases?.includes(first));
    if (command) return command;

    // 群組名稱 + 群組指令
    const subcommandGroup = this.subcommands.get(first);
    if (subcommandGroup) {
      return subcommandGroup.get(second) ||
        subcommandGroup.find(c => !!c.aliases?.includes(second));
    }

    // 捷徑用法 + 參數
    return this.subcommands.map(group => group.get(first) || group.find(c => !!c.aliases?.includes(first))).find(c => c);
  }

	public each(fn: (value: Command<unknown>, key: string, collection: Collection<string, Command<unknown>>) => void): Collection<string, Command<unknown>> {
		return this.commands.each(fn);
  }

  public map<T>(fn: (value: Command<unknown>, key: string, collection: Collection<string, Command<unknown>>) => T): T[] {
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