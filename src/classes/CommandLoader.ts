import fs from "node:fs";
import path from "node:path";
import { Collection } from "discord.js";
import { Command } from "./Command";
import { CommandGroup } from "./CommandGroup";

import type { CommandPath } from "../typings/types";

export class CommandLoader extends null {
  /**
   * 遞迴載入命令
   */
  static load(dirPath: string, parentPath: CommandPath = []): Collection<string, Command> {
    const commands = new Collection<string, Command>();
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.js')) continue;

      const filePath = path.join(dirPath, file.name);
      const C: new () => Command = require(filePath).default;
      const command = new C();

      command.path = [...parentPath, command.name];

      if (command instanceof CommandGroup) {
        const childrenPath = path.join(dirPath, path.basename(file.name, '.js'));
        command.children = this.load(childrenPath, command.path);
      }

      commands.set(command.name, command);
    }

    return commands;
  }
}
