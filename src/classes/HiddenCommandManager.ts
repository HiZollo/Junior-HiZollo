import fs from 'fs';
import path from 'path';
import { Awaitable, Collection, Message, PermissionFlagsBits } from "discord.js";
import { EventEmitter } from "events";
import { HiddenCommand } from "./HiddenCommand";
import { HZClient } from "./HZClient";
import missingPermissions from '../features/utils/missingPermissions';
import { HiddenCommandManagerEvents } from '../utils/interfaces';

export class HiddenCommandManager extends EventEmitter {
  public client: HZClient;
  private commands: Collection<string, HiddenCommand>;
  private loaded: boolean;

  constructor(client: HZClient) {
    super();
    this.client = client;
    this.commands = new Collection();
    this.loaded = false;
  }

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