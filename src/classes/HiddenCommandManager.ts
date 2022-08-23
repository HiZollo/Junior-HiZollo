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

import fs from "node:fs";
import path from "node:path";
import { Awaitable, Collection, Message, PermissionFlagsBits } from "discord.js";
import { EventEmitter } from "node:events";
import { HiddenCommand } from "./HiddenCommand";
import { HZClient } from "./HZClient";
import missingPermissions from '../features/utils/missingPermissions';
import { HiddenCommandManagerEvents } from '../utils/interfaces';

/**
 * 掌管所有隱藏指令
 * @extends EventEmitter
 */
export class HiddenCommandManager extends EventEmitter {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 所有隱藏指令
   */
  private commands: Collection<string, HiddenCommand>;

  /**
   * 隱藏指令是否已載入完畢
   */
  private loaded: boolean;

  /**
   * 建立一個隱藏指令管家
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    super();
    this.client = client;
    this.commands = new Collection();
    this.loaded = false;
  }

  /**
   * 載入所有隱藏指令
   * @param dirPath 要載入的資料夾
   */
  public async load(dirPath: string): Promise<void> {
    if (this.loaded) throw new Error('Autocomplete has already been loaded.');

    const commandFiles = fs.readdirSync(dirPath);
    for (const file of commandFiles) {
      if (!file.endsWith('.js')) continue;
      const C: new () => HiddenCommand = require(path.join(dirPath, file)).default;
      const command = new C();
      this.commands.set(command.name, command);
    }

    this.loaded = true;
  }

  /**
   * 轉接第一線的訊息
   * @param message 從 client#on('messageCreate') 得到的訊息
   */
  public async onMessageCreate(message: Message): Promise<void> {
    if (!message.inGuild()) return;
    if (message.author.blocked || message.author.bot) return;
    if (message.client.devMode && !message.channel.isTestChannel()) return;
    if (missingPermissions([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel], message.channel, message.guild.members.me).length) return;

    const command = this.commands.find(c => c.filter(message));
    if (command && command.execute(message)) {
      this.emit('executed', message, command.name);
    }
  }


  public on<K extends keyof HiddenCommandManagerEvents>(event: K, listener: (...args: HiddenCommandManagerEvents[K]) => Awaitable<void>): this;
  public on<S extends string | symbol>(event: Exclude<S, keyof HiddenCommandManagerEvents>, listener: (...args: any[]) => Awaitable<void>): this;
  public on(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.on(event, listener);
  }

  public once<K extends keyof HiddenCommandManagerEvents>(event: K, listener: (...args: HiddenCommandManagerEvents[K]) => Awaitable<void>): this;
  public once<S extends string | symbol>(event: Exclude<S, keyof HiddenCommandManagerEvents>, listener: (...args: any[]) => Awaitable<void>): this;
  public once(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.once(event, listener);
  }

  public emit<K extends keyof HiddenCommandManagerEvents>(event: K, ...args: HiddenCommandManagerEvents[K]): boolean;
  public emit<S extends string | symbol>(event: Exclude<S, keyof HiddenCommandManagerEvents>, ...args: unknown[]): boolean;
  public emit(event: string | symbol, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  public off<K extends keyof HiddenCommandManagerEvents>(event: K, listener: (...args: HiddenCommandManagerEvents[K]) => Awaitable<void>): this;
  public off<S extends string | symbol>(event: Exclude<S, keyof HiddenCommandManagerEvents>, listener: (...args: any[]) => Awaitable<void>): this;
  public off(event: string | symbol, listener: (...args: any[]) => Awaitable<void>): this {
    return super.off(event, listener);
  }
}