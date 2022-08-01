import { Collection } from 'discord.js';
import { CooldownManagerAddUserOptions, CooldownManagerMethodOptions } from '../utils/interfaces';
import { HZClient } from './HZClient';

export default class CooldownManager {
  public client: HZClient;
  private data: Collection<string, Collection<string, number>>;

  static DefaultCooldown = 0;

  constructor(client: HZClient) {
    this.client = client;
    this.data = new Collection();
  }

  public addCommandList(commandName: string): Collection<string, number> {
    const newList = new Collection<string, number>();
    this.data.set(commandName, newList);
    return newList;
  }

  public getCommandList(commandName: string, create: true): Collection<string, number>;
  public getCommandList(commandName: string, create: false): Collection<string, number> | void;
  public getCommandList(commandName: string, create: boolean): Collection<string, number> | void {
    const list = this.data.get(commandName);
    if (!list && create) {
      return this.addCommandList(commandName);
    }
    return list;
  }

  public addUser({ commandName, userId, duration = CooldownManager.DefaultCooldown }: CooldownManagerAddUserOptions) {
    if (duration === 0) return;
    const list = this.getCommandList(commandName, true);
    list.set(userId, Date.now() + duration * 1000);
    setTimeout(() => {
      if (list.has(userId)) list.delete(userId);
    }, duration * 1000);
  }

  public async removeUser({ commandName, userId }: CooldownManagerMethodOptions): Promise<void> {
    if (!this.client.shard) return this._removeUser({ commandName, userId });

    await this.client.shard.broadcastEval((client, { commandName, userId }) => {
      client.cooldown._removeUser({ commandName, userId});
    }, { context: { commandName, userId } });
  }

  public async checkUser({ commandName, userId }: CooldownManagerMethodOptions): Promise<number> {
    const now = Date.now();
    if (!this.client.shard) {
      const endTime = this._checkUser({ commandName, userId });
      return endTime && endTime > now ? endTime - now : 0;
    }

    const timestamps = await this.client.shard.broadcastEval((client, { commandName, userId, now }) => {
      const endTime = client.cooldown._checkUser({ commandName, userId });
      if (!endTime || endTime <= now) {
        client.cooldown._removeUser({ commandName, userId });
        return 0;
      }
      return endTime - now;
    }, { context: { commandName, userId, now } });
    return Math.max(...timestamps);
  }

  private _removeUser({ commandName, userId }: CooldownManagerMethodOptions): void {
    const list = this.data.get(commandName);
    if (list?.has(userId)) {
      list.delete(userId);
    }
  }

  private _checkUser({ commandName, userId }: CooldownManagerMethodOptions) {
    return this.data.get(commandName)?.get(userId);
  }
}