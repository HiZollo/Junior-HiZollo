import { EmbedBuilder } from "discord.js";
import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { Track } from "../../features/music/Model/Track";
import pageSystem from "../../features/utils/pageSystem";
import { CommandType, PageSystemMode } from "../../utils/enums";
import { PageSystemPagesOptions } from "../../utils/interfaces";

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

    const nowPlaying = source.client.music.getNowPlaying(source.guild.id) as Track;

    const embed = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的音樂中心', iconURL: source.client.user?.displayAvatarURL() })
      .setHiZolloColor();
    
    const pages: PageSystemPagesOptions[][] = [];

    queue.forEach((track, i) => {
      if (i % 10 === 0) pages.push([]);
      pages[~~(i / 10)].push({ name: track.videoLink });
    });

    await pageSystem({
      mode: PageSystemMode.Description, 
      source: source, 
      embed: embed, 
      description: `以下是目前的播放清單\n\n\`>> \`${nowPlaying.videoLink}`, 
      pages: pages, 
      contents: {
        exit: '播放清單已關閉', 
        idle: '播放清單已因閒置過久而關閉'
      }, 
      extendFooter: `總時長 ${this.secondToString(source.client.music.getTotalLength(source.guild.id))}`
    });
  }

  private secondToString(time: number) {
    const bases = [60, 60, 24];
    const basesName = ['秒', '分', '小時', '天'];
    let index = 0, result = '';
    while (time >= bases[index] && index < 3) {
      result = `${time % bases[index]} ${basesName[index]} ${result}`
      time = ~~(time / bases[index]);
      index++;
    }
    return `${time} ${basesName[index]} ${result}`;
  }
}