import { ApplicationCommandOptionType, GuildMember, PermissionsBitField } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import removeMd from "../features/utils/removeMd";
import { CommandOptionType, CommandType } from "../utils/enums";

export default class Avatar extends Command<GuildMember[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'avatar', 
      description: '查看多個成員的頭像', 
      extraDescription: '不填參數時可以查看自己的頭像', 
      aliases: ['av'], 
      options: [{ 
        type: ApplicationCommandOptionType.User, 
        parseAs: CommandOptionType.Member, 
        name: '成員%i', 
        description: '伺服器中的成員', 
        required: false, 
        repeat: true
      }], 
      permissions: {
        bot: [PermissionsBitField.Flags.AttachFiles]
      }
    });
  }

  public async execute(source: Source, members: GuildMember[]): Promise<void> {
    await source.defer();
    members = members.filter(m => m).filter((member, i, arr) => i === arr.findIndex(m => m.id === member.id));
    if (!members.length) members = [source.member as GuildMember];

    members.forEach(async member => {
      const name = source.user.id === member.id ? '你' : source.client.user?.id === member.id ? '我' : ` ${removeMd(member.displayName)} `;
      await source.update({
        content: `以下是${name}的頭像`,
        files: [{
          attachment: member.displayAvatarURL({ extension: 'png', size: 4096 }),
          name: 'avatar.png'
        }]
      });
    });
  }
}
