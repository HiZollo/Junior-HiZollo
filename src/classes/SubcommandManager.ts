import fs from "fs";
import path from "path";
import { Collection } from "discord.js";
import { Command } from "./Command";
import { HZClient } from "./HZClient";
import { SubcommandGroup } from "../utils/interfaces";
import { CommandType } from "../utils/enums";

export class SubcommandManager {
  public client: HZClient;
  public data: Collection<string, SubcommandGroup>;

  constructor(client: HZClient) {
    this.client = client;
    this.data = new Collection();
  }

  public async load(dirPath: string, parent: Command<unknown>): Promise<void> {
    const subcommandFiles = fs.readdirSync(dirPath);
    const group = new Collection<string, Command<unknown>>();

    for (const subcommandFile of subcommandFiles) {
      if (!subcommandFile.endsWith('.js')) continue;
      
      const C: new () => Command<unknown> = require(path.join(dirPath, subcommandFile)).default;
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

  public search(commandName: [string, string | undefined]): Command<unknown> | SubcommandGroup | void {
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