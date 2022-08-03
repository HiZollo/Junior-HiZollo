import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { bot } from "../constant.json";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Botinfo extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'botinfo', 
      description: '取得 HiZollo 的基本資料', 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();

    const { client, guild } = source;
    const totalGuildCount = await client.shard
      ?.fetchClientValues('guilds.cache.size')
      .then(results => results.reduce((acc, gc) => (acc as number) + (gc as number), 0));
    const totalUserCount = await client.shard
      ?.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
      .then(results => results.reduce((acc, mc) => acc + mc, 0));

    const info = new EmbedBuilder().applyHiZolloSettings(source.member, '我的基本資料')
      .setThumbnail(client.user?.displayAvatarURL({ extension: 'png', size: 2048 }) ?? null)
      .addFields(
        { name: '版本', value: bot.version },
        { name: 'Discord 使用者名稱', value: client.user?.tag ?? '無法取得' },
        { name: '在此伺服器暱稱', value: guild?.members.me?.nickname ?? '無' },
        { name: '服務伺服器數量', value: `${totalGuildCount ?? '無法取得'}` },
        { name: '服務使用者數量', value: `${totalUserCount ?? '無法取得'}` },
        { name: '上線時間', value: `${this.millisecondToString(client.uptime) ?? '無法取得'}` },
        { name: `加入 ${guild?.name} 日期`, value: guild?.joinedTimestamp ? `<t:${~~(guild?.joinedTimestamp/1000)}:D>` : '無法取得' }
      );
    await source.update({ embeds: [info] });
  }

  
  private millisecondToString(time: number | null): string | null {
    if (time == null) return null;

    const bases = [1000, 60, 60, 24];
    const basesName = ['毫秒', '秒', '分鐘', '小時', '天'];
    let index = 0;
    while (time >= bases[index] && index < 4) {
      time = ~~(time / bases[index]);
      index++;
    }
    return `${time} ${basesName[index]}`;
  }
}