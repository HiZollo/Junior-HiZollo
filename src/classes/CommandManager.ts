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

import { EventEmitter } from "node:events";
import { Awaitable, Collection, Interaction, Message, PermissionFlagsBits } from "discord.js";
import { Command } from "./Command";
import { CommandGroup } from "./CommandGroup";
import { CommandLoader } from "./CommandLoader";
import { CommandParser } from "./CommandParser";
import { HZClient } from "./HZClient";
import { Source } from "./Source";
import { Translator } from "./Translator";
import config from '@root/config';
import missingPermissions from "../features/utils/missingPermissions";
import { CommandManagerRejectReason, CommandParserOptionResultStatus, CommandType } from "../typings/enums";
import { CommandManagerEvents, CommandPermission } from "../typings/interfaces";
import { CommandManagerRejectInfo, CommandPath } from "../typings/types";

interface MessageCommandResolution {
  command: Command;
  consumed: number;
}

/**
 * 掌管所有與指令相關的操作，支援多層群組指令，必須保證 help 指令存在
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
    this.loaded = false;
  }

  /**
   * 載入所有指令
   * @param dirPath 要載入的資料夾
   */
  public async load(dirPath: string): Promise<void> {
    if (this.loaded) throw new Error("Commands have already been loaded.");

    this.commands = CommandLoader.load(dirPath);

    this.loaded = true;
    this.emit("loaded");
  }

  /**
   * 轉接第一線的指令互動
   * @param interaction 從 client#on('interactionCreate') 得到的指令互動
   */
  public async onInteractionCreate(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return;
    if (interaction.user.blocked || interaction.user.bot) return;
    if (this.client.devMode && !interaction.channel?.isTestChannel()) return;

    const channel = interaction.channel;
    const member = interaction.member;
    if (!channel || !member) return;


    const subcommandGroup = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand(false);

    let commandPath: CommandPath = [
      interaction.commandName,
      ...(subcommandGroup ? [subcommandGroup] : []),
      ...(subcommand ? [subcommand] : [])
    ];

    // /z 的既有 shortcut
    if (interaction.commandName === "z" && subcommand) {
      commandPath = Translator.getFullCommandName(subcommand) ?? commandPath;
    }

    const command = this.get(commandPath);
    const commandName = command?.path ?? commandPath;

    // 重新部署的全域指令有可能因為快取問題而無法使用
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
    const effectivePermissions = this.getEffectivePermissions(command);
    const userMissing = missingPermissions(effectivePermissions.user ?? [], channel, member);
    if (userMissing.length) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.UserMissingPermission, args: [userMissing] });
      return;
    }

    const botMissing = missingPermissions(effectivePermissions.bot ?? [], channel, interaction.guild.members.me);
    if (botMissing.length) {
      this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.BotMissingPermission, args: [botMissing] });
      return;
    }
    /**/

    /***** 檢查冷卻 *****/
    if (!channel.isTestChannel()) {
      const cooldownKey = command.path.join(" ");
      const timeLeft = await this.client.cooldown.checkUser({ commandName: cooldownKey, userId: interaction.user.id });
      if (timeLeft) {
        this.emit('reject', new Source(interaction, channel, member), { reason: CommandManagerRejectReason.InCooldown, args: [timeLeft] });
        return;
      }
      this.client.cooldown.addUser({
        commandName: cooldownKey,
        userId: interaction.user.id,
        duration: this.getEffectiveCooldown(command)
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
    const tokens = content.split(/\s+/);
    const resolution = this.resolveMessage(tokens);
    if (!resolution) return;

    const { command, consumed } = resolution;
    const commandName = command.path;

    const matches = [...content.matchAll(/\S+/g)];
    const lastMatch = matches[consumed - 1];
    const rawArgs = content.slice(lastMatch.index! + lastMatch[0].length).trim();

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
    const effectivePermissions = this.getEffectivePermissions(command);
    const userMissing = missingPermissions(effectivePermissions.user ?? [], message.channel, message.member);
    if (userMissing.length) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.UserMissingPermission, args: [userMissing] });
      return;
    }

    const botMissing = missingPermissions(effectivePermissions.bot ?? [], message.channel, message.guild.members.me);
    if (botMissing.length) {
      this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.BotMissingPermission, args: [botMissing] });
      return;
    }
    /**/

    /***** 檢查冷卻 *****/
    if (!message.channel.isTestChannel()) {
      const cooldownKey = command.path.join(" ");
      const timeLeft = await message.client.cooldown.checkUser({ commandName: cooldownKey, userId: message.author.id });
      if (timeLeft) {
        this.emit('reject', new Source(message, channel, member), { reason: CommandManagerRejectReason.InCooldown, args: [timeLeft] });
        return;
      }
      message.client.cooldown.addUser({
        userId: message.author.id,
        commandName: cooldownKey,
        duration: this.getEffectiveCooldown(command)
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
   * 從 Message tokens 找出最長有效指令
   */
  private resolveMessage(tokens: string[]): MessageCommandResolution | null {
    if (!tokens.length) return null;

    // 先找 z 指令捷徑
    if (tokens[0].toLowerCase() === "z" && tokens[1]) {
      const path = Translator.getFullCommandName(tokens[1].toLowerCase());

      if (path) {
        const command = this.get(path);
        if (command) return { command, consumed: 2 };
      }
    }

    let commands = this.commands;
    let current: Command | null = null;
    let consumed = 0;

    for (const token of tokens) {
      const command = this.findCommand(commands, token);
      if (!command) break;

      current = command;
      consumed++;

      if (!(command instanceof CommandGroup)) break;
      commands = command.children;
    }

    if (current) return { command: current, consumed };

    // 如果沒找到，還有可能是指令捷徑
    const shortcut = this.findSubcommandShortcut(tokens[0]);
    if (shortcut) return { command: shortcut, consumed: 1 };
    return null;
  }

  /**
   * 在指定 Collection 中尋找指令，可以使用別名
   */
  private findCommand(commands: Collection<string, Command>, name: string): Command | null {
    const key = name.toLowerCase();
    return commands.get(key) ?? commands.find(command => command.aliases?.includes(key)) ?? null;
  }

  /**
   * 依完整路徑取得指令
   */
  public get(path: CommandPath): Command | null {
    if (!path.length) return null

    let commands = this.commands;
    let command: Command | null = null;

    for (let i = 0; i < path.length; i++) {
      command = this.findCommand(commands, path[i]);
      if (!command) return null;
      if (i < path.length - 1 && !(command instanceof CommandGroup)) return null;
      if (command instanceof CommandGroup) commands = command.children;
    }

    return command;
  }

  private findSubcommandShortcut(name: string): Command | null {
    const key = name.toLowerCase();

    for (const group of this.commands.values()) {
      if (!(group instanceof CommandGroup)) continue;

      const command = this.findCommand(group.children, key);

      if (command) return command;
    }

    return null;
  }

  /**
   * 尋找並回傳指令或指令群，支援群組指令、捷徑用法
   * @param path 要搜尋的指令路徑
   * @returns 找到的指令或指令群
   */
  public search(path: CommandPath): Command | null {
    const root = this.findCommand(this.commands, path[0]);
    if (root) return this.get(path);

    return this.findSubcommandShortcut(path[0]);
  }

  /**
   * 取得指令的有效權限
   *
   * 權限繼承規則：
   * 1. 所有所屬指令群組的權限都會繼承。
   * 2. 指令本身的權限也會加入。
   * 3. 不會覆蓋父層權限。
   * 4. 重複的權限會自動去除。
   */
  private getEffectivePermissions(command: Command): CommandPermission {
    const user = new Set<bigint>();
    const bot = new Set<bigint>();

    for (let depth = 1; depth <= command.path.length; depth++) {
      const current = this.get(command.path.slice(0, depth));

      if (!current) continue;

      for (const permission of current.permissions?.user ?? []) {
        user.add(permission);
      }

      for (const permission of current.permissions?.bot ?? []) {
        bot.add(permission);
      }
    }

    return {
      user: [...user],
      bot: [...bot]
    };
  }

  /**
   * 取得指令的有效冷卻時間
   *
   * 冷卻繼承規則：
   * 1. 優先使用指令本身的冷卻時間（0 不會當成 false 而是停用冷卻）。
   * 2. 未設定時，繼承最近一層父指令的冷卻時間。
   * 3. 若所有父指令都未設定，則不使用冷卻。
   */
  private getEffectiveCooldown(command: Command): number {
    for (let depth = command.path.length; depth > 0; depth--) {
      const current = this.get(command.path.slice(0, depth));
      if (current?.cooldown !== undefined) return current.cooldown;
    }

    return 0;
  }

  public *walk(commands: Collection<string, Command> = this.commands): IterableIterator<Command> {
    for (const command of commands.values()) {
      yield command;

      if (command instanceof CommandGroup) {
        yield* this.walk(command.children);
      }
    }
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
