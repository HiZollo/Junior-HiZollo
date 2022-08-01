import { ApplicationCommandOptionType, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Unblock extends Command<[User]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'unblock', 
      description: '將一位使用者暫時性的解除全域封鎖，在機器人下線後名單會被重置', 
      options: [{ 
        type: ApplicationCommandOptionType.User, 
        name: '使用者', 
        description: '要解封的使用者', 
        required: true
      }]
    });
  }

  public async execute(source: Source, [user]: [User]): Promise<void> {
    await source.defer();
    await source.client.shard?.broadcastEval((client, { userId }) => {
      client.unblock(userId);
    }, { context: { userId: user.id } })
    await source.update(`已成功暫時解除 ${user} 的全域封鎖`);
  }
}