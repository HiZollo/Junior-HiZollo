import { CooldownManagerAddUserOptions, CooldownManagerMethodOptions } from '../utils/interfaces';
import { HZClient } from './HZClient';

/**
 * 跨分支的指令冷卻系統
 */
export default class CooldownManager {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 指令名稱－（使用者 ID－冷卻結束時間戳）的鍵值對
   */
  private data: Map<string, Map<string, number>>;

  /**
   * 預設冷卻時間，單位為秒
   */
  static DefaultCooldown = 0;

  /**
   * 建立一個冷卻系統管家
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    this.client = client;
    this.data = new Map();
  }

  /**
   * 新增指令到冷卻系統中
   * @param commandName 指令名稱
   * @returns 新增的冷卻表
   */
  public addCommandList(commandName: string): Map<string, number> {
    const newList = new Map<string, number>();
    this.data.set(commandName, newList);
    return newList;
  }

  /**
   * 取得指定指令的冷卻表
   * @param commandName 指令名稱
   * @param create 是否在找不到冷卻表時新建一個
   * @returns 冷卻表
   */
  public getCommandList(commandName: string, create: true): Map<string, number>;
  public getCommandList(commandName: string, create: false): Map<string, number> | void;
  public getCommandList(commandName: string, create: boolean): Map<string, number> | void {
    const list = this.data.get(commandName);
    if (!list && create) {
      return this.addCommandList(commandName);
    }
    return list;
  }

  /**
   * 新增一位使用者到指定指令的冷卻表中，這個操作只會對單個分支進行
   * @param options 
   */
  public addUser({ commandName, userId, duration = CooldownManager.DefaultCooldown }: CooldownManagerAddUserOptions): void {
    if (duration === 0) return;
    const list = this.getCommandList(commandName, true);
    list.set(userId, Date.now() + duration * 1000);
    setTimeout(() => {
      if (list.has(userId)) list.delete(userId);
    }, duration * 1000);
  }

  /**
   * 強制把一位使用者從指定指令的冷卻表中移除，這個操作會對所有分支進行
   * @param options 
   * @returns 是否成功將使用者移除
   */
  public async removeUser({ commandName, userId }: CooldownManagerMethodOptions): Promise<boolean> {
    if (!this.client.shard) return this._removeUser({ commandName, userId });

    const result = await this.client.shard.broadcastEval((client, { commandName, userId }) => {
      return client.cooldown._removeUser({ commandName, userId});
    }, { context: { commandName, userId } });
    return result.some(r => r);
  }

  /**
   * 查看一位使用者對於某個指令的剩餘冷卻時間，若無冷卻則回傳 0，這個操作會對所有分支進行
   * @param options 
   * @returns 剩餘冷卻時間，單位為毫秒
   */
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

  /**
   * 強制把一位使用者從指定指令的冷卻表中移除，這個操作只會對單個分支進行
   * @param options 
   * @returns 是否成功將使用者移除
   */
  private _removeUser({ commandName, userId }: CooldownManagerMethodOptions): boolean {
    const list = this.data.get(commandName);
    return !!list?.delete(userId);
  }

  /**
   * 查看一位使用者對於某個指令的冷卻結束時間戳，這個操作只會對單個分支進行
   * @param options 
   * @returns 剩餘冷卻時間戳
   */
  private _checkUser({ commandName, userId }: CooldownManagerMethodOptions) {
    return this.data.get(commandName)?.get(userId);
  }
}