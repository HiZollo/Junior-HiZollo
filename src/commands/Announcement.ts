import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { bot, websiteLinks } from "../constant.json";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import recentUpdate from "../features/info/recentUpdate";
import { CommandType } from "../utils/enums";

export default class Announcement extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'announcement', 
      description: '顯示我的官方公告以及更新日誌', 
      aliases: ['ann'], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const announcement = new EmbedBuilder().applyHiZolloSettings(source.member, 'HiZollo 開發團隊公告')
      .addFields({
        name: '📢 重要公告', 
        value: 
          `我們重新設計了我們的[網站](${websiteLinks.main} "HiZollo 官方網站")，他現在看起來應該更舒適了，且多了許多資訊。\n\n`+
          `HiZollo 的開發者開始寫開發日誌了！你可以[點此](${websiteLinks.blog} "開發日誌")前去閱讀。`
      }, {
        name: `📰 最新更新 - ${bot.version}`, 
        value: `> **${bot.releaseDate.year} 年 ${bot.releaseDate.month} 月 ${bot.releaseDate.date} 日**${recentUpdate}`
      });
    await source.update({ embeds: [announcement] });
  }
}
