import fs from "fs";
import path from "path";
import { Collection } from "discord.js";
import { Command } from "./Command";
import { HZClient } from "./HZClient";
import { SubcommandGroup } from "../utils/interfaces";
import { CommandType } from "../utils/enums";

/**
 * 掌管所有指令群／群組指令
 */
export class SubcommandManager {
  /**
   * 機器人的 client
   */
  public client: HZClient;

  /**
   * 群組名稱－指令群的鍵值對
   */
  public data: Collection<string, SubcommandGroup>;

  /**
   * 建立一個群組指令管家
   * @param client 機器人的 client
   */
  constructor(client: HZClient) {
    this.client = client;
    this.data = new Collection();
  }

  /**
   * 載入單個指令群
   * @param dirPath 指令群所在的資料夾路徑
   * @param parent 父指令
   */
  public async load(dirPath: string, parent: Command): Promise<void> {
    const subcommandFiles = fs.readdirSync(dirPath);
    const group = new Collection<string, Command>();

    for (const subcommandFile of subcommandFiles) {
      if (!subcommandFile.endsWith('.js')) continue;
      
      const C: new () => Command = require(path.join(dirPath, subcommandFile)).default;
      const instance = new C();
      group.set(instance.name, instance);
    }

    this.data.set(parent.name, {
      type: CommandType.SubcommandGroup, 
      name: parent.name, 
      description: parent.description, 
      aliases: parent.aliases, 
      data: group
    });
  }

  /**
   * 尋找並回傳指令或指令群，支援捷徑用法
   * @param commandName 要搜尋的指令名稱，支援捷徑用法
   * @returns 找到的指令或指令群
   */
  public search(commandName: [string, string | undefined]): Command | SubcommandGroup | void {
    const first = commandName[0].toLowerCase();
    const second = commandName[1]?.toLowerCase();

    // 先找群組
    const group = this.data.get(first) || this.data.find(g => !!g.aliases?.includes(first));
    if (group) {
      return second ? group.data.get(second) || group.data.find(c => !!c.aliases?.includes(second)) : group;
    }

    // 再找捷徑，假設沒有 collision
    return this.data.map(({ data }) => data.get(first) || data.find(c => !!c.aliases?.includes(first))).find(c => c);
  }

  public each(fn: (value: SubcommandGroup, key: string, collection: Collection<string, SubcommandGroup>) => void): Collection<string, SubcommandGroup> {
		return this.data.each(fn);
  }

  public map<T>(fn: (value: SubcommandGroup, key: string, collection: Collection<string, SubcommandGroup>) => T): T[] {
		return this.data.map(fn);
  }
}