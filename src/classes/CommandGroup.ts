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
    super({ ...options, type: CommandType.SubcommandGroup });
    this.children = new Collection();
  }

  /**
   * 預設行為是顯示此指令群組的指令列表
   */
  public override async execute(source: Source): Promise<void> {
    await CommandHelpRenderer.show(source, this.path.join(' '), this.children);
  }
}
