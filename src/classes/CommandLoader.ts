/*
 * 
 * Copyright 2026 HiZollo Dev Team <https://github.com/hizollo>
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
