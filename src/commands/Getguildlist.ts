import { EmbedBuilder } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import pageSystem from "../features/utils/pageSystem";
import { CommandType, PageSystemMode } from "../utils/enums";

type GuildInfo = {
  id: string, 
  memberCount: number, 
  name: string, 
  shardId?: number
};

export default class Getguildlist extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Developer, 
      name: 'getguildlist', 
      description: '獲取 HiZollo 所在的伺服器列表', 
      aliases: ['ggl'],
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const guildLists: GuildInfo[][] | undefined = await source.client.shard?.broadcastEval(client => {
      return client.guilds.cache.map(guild => ({
        id: guild.id,
        memberCount: guild.memberCount,
        name: guild.name,
        shardId: client.shard?.ids[0]
      }));
    });

    if (!guildLists) {
      await source.update('找不到分支資訊');
      return;
    }

    const pages: ({ name: string, id: string })[][] = [];
    guildLists
      .reduce((acc, guild) => acc.concat(guild), [])
      .sort((gA, gB) => gB.memberCount - gA.memberCount)
      .forEach((g, i) => {
        if (i % 10 === 0) pages.push([]);
        pages[~~(i/10)].push({ name: `${g.name}｜分支 ${g.shardId}｜${g.memberCount} 位成員\n`, id: g.id });
      });
    
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'HiZollo 的伺服器中心', iconURL: source.client.user?.displayAvatarURL() })
      .setHiZolloColor();
    
    const result = await pageSystem({
      mode: PageSystemMode.Description,
      allowSelect: true,
      description: '請選擇一個伺服器以查看其資訊',
      source: source,
      pages: pages,
      embed: embed, 
      contents: {
        exit: '清單已關閉', 
        idle: '清單因閒置過久而關閉'
      }
    });

    const findguild = source.client.commands.search(['findguild', undefined]);
    if (findguild instanceof Command) {
      await findguild.execute(source, [result?.id]);
    }
  }
}
