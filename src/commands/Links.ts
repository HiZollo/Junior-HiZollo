/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { bot, mainGuild, websiteLinks } from "@root/constant.json";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Links extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'links', 
      description: '顯示和我有關的所有連結', 
      aliases: ['link', 'hzweb', 'invite', 'website'], 
      permissions: {
        bot: [PermissionFlagsBits.EmbedLinks]
      }
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    const links = new EmbedBuilder()
    .applyHiZolloSettings(source.member, 'HiZollo 的相關連結')
    .addFields({
      name: '官方網站連結',
      value: `HiZollo 官網上各部分的連結，相關資訊都在這裡\n`+
             `● [網站首頁](${websiteLinks.main} "HiZollo 網站首頁")\n`+
             `● [更新日誌](${websiteLinks.changelog} "HiZollo 的更新日誌")\n`+
             `● [指令列表](${websiteLinks.commands} "HiZollo 的指令列表")\n`+
             `● [用戶條款](${websiteLinks.tos} "HiZollo 使用者條款")`
    }, {
      name: 'Github 專案連結',
      value: `HiZollo Organization 的相關連結\n`+
             `● [組織網站](${websiteLinks.github} "HiZollo 組織網站")\n`+
             `● [原始碼](${websiteLinks.source} "HiZollo 原始碼")`
    }, {
      name: '機器人列表連結',
      value: `各個機器人列表上的 HiZollo，不要忘記為我投下一票喔\n`+
             `● [Top.gg](${websiteLinks.topgg} "前往 HiZollo 的 Top.gg 頁面")\n`+
             `● [DiscordTW](${websiteLinks.dtw} "前往 HiZollo 的 DiscordTW 頁面")`
    }, {
      name: '邀請連結',
      value: `如果你覺得 HiZollo 很不錯，可以[點此](https://discord.com/api/oauth2/authorize?client_id=584677291318312963&permissions=${source.client.invitePermissions.bitfield}&scope=bot%20applications.commands "邀請 HiZollo！")將他加入你的伺服器\n`+
             `如果你習慣自己設定權限，可以使用[這個連結](${bot.inviteLink.customized} "邀請 HiZollo！")，`+
             `但使用此連結請不要忘記設定權限，否則將無法使用機器人的功能`
    }, {
      name: mainGuild.name,
      value: `如果你有任何問題或建議，可以加入 [${mainGuild.name}](${mainGuild.inviteLink} "點擊以加入我們！")，在這裡會有專人聽取你的建議跟解答你的問題`
    });
    await source.update({ embeds: [links] });
  }
}