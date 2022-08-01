import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../utils/enums";

export default class MusicPlaylist extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      name: 'playlist', 
      description: '顯示目前的待播清單', 
      aliases: ['pl', 'queue', 'q']
    });
  }

  public async execute(source: Source): Promise<void> {
    if (!source.client.music.has(source.guild.id)) {
      await source.defer({ ephemeral: true });
      await source.update('我並不在任何音樂頻道中');
      return;
    }

    const queue = source.client.music.getQueue(source.guild.id);
    if (!queue.length) {
      await source.defer({ ephemeral: true });
      await source.update('待播清單中目前沒有任何歌曲');
      return;
    }

    await source.defer();
    await source.update('以下是目前的播放清單\n' + queue.map(track => track.title).join('\n'));
  }
}