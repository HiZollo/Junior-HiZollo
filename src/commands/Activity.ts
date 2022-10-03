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

import { ButtonBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ApplicationCommandOptionType, ButtonStyle, ChannelType, EmbedBuilder, InviteTargetType, PermissionFlagsBits } from "discord.js";
import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import { CommandType } from "../utils/enums";

export default class Youtube extends Command<[keyof typeof appIds]> {
  constructor() {
    super({ 
      type: CommandType.Fun, 
      name: 'activity', 
      description: '讓你可以在 Discord 的語音頻道中與朋友同樂', 
      extraDescription: '不填參數時我會建立可以讓你看 Youtube 的連結', 
      aliases: ['youtube', 'yt'], 
      options: [{
        type: ApplicationCommandOptionType.String,
        name: '活動',
        description: '你要玩的活動',
        required: false,
        choices: Object.keys(appIds).map(id => ({ name: id, value: id }))
      }],
      permissions: {
        bot: [PermissionFlagsBits.CreateInstantInvite]
      }
    });
  }

  public async execute(source: Source, [appName]: [keyof typeof appIds]): Promise<void> {
    if (!(source.member && 'voice' in source.member && source.member.voice.channel)) {
      await source.defer({ ephemeral: true });
      await source.update('你必須在語音頻道內才能使用此指令');
      return;
    }
    if (source.member.voice.channel?.type === ChannelType.GuildStageVoice) {
      await source.defer({ ephemeral: true });
      await source.update('此功能不支援舞台頻道，請到一般的語音頻道後再使用');
      return;
    }
    await source.defer();

    if (!appName) appName = "WatchTogether";

    const invite = await source.member.voice.channel.createInvite({
      maxUses: 0,
      targetType: InviteTargetType.EmbeddedApplication,
      targetApplication: appIds[appName]
    });

    const inviteButton = new ButtonBuilder({
      label: '點我！',
      style: ButtonStyle.Link,
      url: invite.toString()
    });

    const helper = new EmbedBuilder()
      .applyHiZolloSettings(source.member, 'HiZollo 的幫助中心')
      .setDescription(`請點擊以下按鈕以開始在語音頻道中使用 ${appName}！`);

    await source.update({
      embeds: [helper],
      components: [new ActionRowBuilder<ButtonBuilder>({
        components: [inviteButton]
      })]
    });
  }
}

const appIds = Object.freeze({
  // "YouTubeTogether": "755600276941176913", 
  "WatchTogether": "880218394199220334",  // 新的 YouTubeTogether
  "PokerNight": "755827207812677713",
  "Betrayal.io": "773336526917861400",
  "Fishington.io": "814288819477020702",
  "ChessInThePark": "832012774040141894",
  "SketchyArtist": "879864070101172255",
  "Awkword": "879863881349087252",
  "DoodleCrew": "878067389634314250",
  "SketchHeads": "902271654783242291",
  "LetterLeague": "879863686565621790",
  "WordSnacks": "879863976006127627",
  "SpellCast": "852509694341283871",
  "CheckersInThePark": "832013003968348200",
  "Blazing8s": "832025144389533716",
  "PuttParty": "945737671223947305",
  "Land-io": "903769130790969345",
  "BobbleLeague": "947957217959759964",
  "AskAway": "976052223358406656",
  "KnowWhatIMeme": "950505761862189096"
});