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
import { Collection } from "discord.js";
import { Command } from "./Command";
import { CommandHelpRenderer } from "./CommandHelpRenderer";
import { Source } from "./Source";
import { CommandType } from "../typings/enums";
import { CommandOptions } from "../typings/interfaces";

/**
 * 管理指令群組的指令
 */
export class CommandGroup extends Command<[]> {
  /**
   * 此指令群組的子指令
   */
  public children: Collection<string, Command>;

  constructor(options: Omit<CommandOptions, "type">) {
    super({ ...options, type: CommandType.CommandGroup });
    this.children = new Collection();
  }

  /**
   * 預設行為是顯示此指令群組的指令列表
   */
  public override async execute(source: Source): Promise<void> {
    await source.defer({ ephemeral: true });
    await source.update(CommandHelpRenderer.getGroupMessage(source, this, source.channel.isTestChannel()));
  }
}
