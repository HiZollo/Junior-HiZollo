import { EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType, PageSystemMode } from "../utils/enums";
import { PageSystemPagesOptions } from "../utils/interfaces";
import pageSystem from "../features/utils/pageSystem";

export default class Connection extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Developer, 
      name: 'connection', 
      description: '查看 HiZollo 的語音連線情形', 
      extraDescription: '也可以把指定的語音連線截斷', 
      aliases: ['con']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();

    const connections = await source.client.shard?.broadcastEval(client => {
      return client.music.map(manager => ({
        name: manager.guild.name,
        id: manager.guild.id,
        members: client.user?.id && manager.voiceChannel.members.has(client.user.id) ? 
          manager.voiceChannel.members.first(5).map(v => `<@${v.id}>`).join(', ') : null
      }));
    }).then(r => r.reduce((acc, now) => acc.concat(now), []));

    const pages: PageSystemPagesOptions[][] = [];
    let index = 0;
    connections?.forEach(con => {
      if (!con.members || con.members === `<@${source.client.user?.id}>`) {
        source.client.music.leave(con.id);
      }
      else {
        if (index % 5 === 0) pages.push([]);
        pages[~~(index / 5)].push({
          name: `${con.name}\n\`GID\` ${con.id}\n\`USR\` ${con.members}`,
          guildName: con.name, 
          id: con.id
        });
        index++;
      }
    });

    if (!pages.length) {
      await source.update('沒有人在聽音樂');
      return;
    }

    const embed = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 的音樂中心');

    const selected = await pageSystem({
      mode: PageSystemMode.Description, 
      source: source, 
      embed: embed, 
      description: '請選擇一個連線以將其從記錄中刪除', 
      pages: pages, 
      contents: {
        exit: '清單已關閉', 
        idle: '清單已因閒置過久而關閉'
      }, 
      allowSelect: true
    });

    if (selected) {
      source.client.music.leave(selected.id);
      await source.update(`已退出 ${selected.guildName}`);
    }
  }
}