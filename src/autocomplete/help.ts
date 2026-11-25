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

import { Command } from "../classes/Command";
import { CommandGroup } from "../classes/CommandGroup";
import { HZClient } from "../classes/HZClient";
import { CommandType } from "../typings/enums";
import { AutocompleteData } from "../typings/types";

export default function(client: HZClient): AutocompleteData {
  const commands: AutocompleteData["指令名稱"] = [];

  const isDevOnly = (command: Command): boolean => {
    if (command instanceof CommandGroup) return [...command.children.values()].every(isDevOnly);
    return command.type === CommandType.Developer;
  };

  const visit = (items: Iterable<Command>): void => {
    for (const command of items) {
      commands.push({
        name: command.path.join(' '),
        devOnly: isDevOnly(command)
      });

      if (command instanceof CommandGroup) visit(command.children.values());
    }
  };

  visit(client.commands.commands.values());

  return { '指令名稱': commands };
}
