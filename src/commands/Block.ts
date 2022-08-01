import { ApplicationCommandOptionType, User } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Block extends Command<[User]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'block', 
      description: '將一位使用者暫時性的全域封鎖，在機器人下線後名單會被重置', 
      options: [{ 
        type: ApplicationCommandOptionType.User, 
        name: '使用者', 
        description: '要封鎖的使用者', 
        required: true
      }]
    });
  }

  public async execute(source: Source, [user]: [User]): Promise<void> {
    await source.defer();
    await source.client.shard?.broadcastEval((client, { userId }) => {
      client.block(userId);
    }, { context: { userId: user.id } })
    await source.update(`已成功將 ${user} 暫時性全域封鎖`);
  }
}