import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../utils/enums";
import { PermissionFlagsBits } from "discord.js";

export default class MusicLeave extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'leave', 
      description: '讓我離開語音頻道', 
      extraDescription: '若加入的是舞台頻道，可以額外在後面指定 false，讓機器人只有播歌的時候會成為發言人，其他時候會自動退下', 
      aliases: ['l'], 
      permissions: {
        bot: [PermissionFlagsBits.Connect]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    if (!source.guild.members.me?.voice.channel) {
      await source.defer({ ephemeral: true });
      await source.update('我並沒有在任何語音頻道內，你是不是搞錯了什麼');
      return;
    }
    if (!source.member.voice.channel) {
      await source.defer({ ephemeral: true });
      await source.update('你必須加入我的語音頻道才可以使用這個指令');
      return;
    }
    if (source.member.voice.channelId !== source.guild.members.me.voice.channelId) {
      await source.defer({ ephemeral: true });
      await source.update('我跟你並不在同一個語音頻道，因此你無法使用此指令');
      return;
    }

    await source.defer();
    source.client.music.leave(source.member.voice.channel.guild.id);
    await source.update(`已離開 \`${source.member.voice.channel.name}\``);
  }
}