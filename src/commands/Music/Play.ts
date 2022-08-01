import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { ArgumentParseType, CommandType, PlayMusicResultType } from "../../utils/enums";
import { ApplicationCommandOptionType, ChannelType, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { GuildMusicManager } from "../../features/music/Model/GuildMusicManager";

export default class MusicPlay extends Command<[string]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'play', 
      description: '加入語音頻道', 
      extraDescription: '若加入的是舞台頻道，可以額外在後面指定 false，讓機器人只有播歌的時候會成為發言人，其他時候會自動退下', 
      aliases: ['p'], 
      options: [{
        type: ApplicationCommandOptionType.String, 
        name: '影片', 
        description: '可以是關鍵字、Youtube 影片連結或 Youtube 播放清單連結', 
        required: true
      }], 
      argumentParseMethod: {
        type: ArgumentParseType.None
      }, 
      permissions: {
        bot: [PermissionFlagsBits.Speak]
      }
    });
  }

  public async execute(source: Source, [keywordOrUrl]: [string]): Promise<void> {
    if (!source.client.music.has(source.guild.id)) {
      await source.client.commands.subcommands.get('music')?.get('join')?.execute(source, [true]);
      if (!source.guild.members.me?.voice.channel) return;
    }

    if (!source.deferred) await source.defer();

    const manager = source.client.music.get(source.guild.id) as GuildMusicManager;
    if (manager.voiceChannel.type === ChannelType.GuildStageVoice && manager.voiceState.suppress
        && !manager.guild.members.me?.permissions.has(PermissionsBitField.StageModerator)) {
      await source.temp('我沒有辦法在這舞台頻道上發言！請你給我發言權或是讓我成為舞台版主');
      return;
    }

    const result = await source.client.music.play(source.guild.id, source.member, keywordOrUrl);
    switch (result.type) {
      case PlayMusicResultType.StartPlaying:
        await source.temp(`已開始播放 ${result.track.title}`);
        return;
      
      case PlayMusicResultType.AddedToQueue:
        await source.temp(`已將 ${result.track.title} 加入待播清單`);
        return;
      
      case PlayMusicResultType.NotInVoiceChannel:
        await source.temp(`我並不在任何語音頻道中`);
        return;
      
      case PlayMusicResultType.ResourceNotFound:
        await source.temp(`我找不到這首歌曲，請確認網址或關鍵字有沒有輸入錯誤`);
        return;
    }
  }
}