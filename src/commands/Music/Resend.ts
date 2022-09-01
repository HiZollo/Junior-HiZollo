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

import { Command } from "../../classes/Command";
import { Source } from "../../classes/Source";
import { CommandType } from "../../utils/enums";

export default class MusicResend extends Command<[]> {
  constructor() {
    super({
      type: CommandType.Utility, 
      parent: 'music', 
      name: 'resend', 
      description: '重新傳送音樂遙控器', 
      aliases: ['rs']
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.hide();
    if (!source.guild.members.me?.voice.channel) {
      await source.temp('我並沒有在任何語音頻道內，你是不是搞錯了什麼');
      return;
    }
    if (!source.member.voice.channel) {
      await source.temp('你必須加入我的語音頻道才可以使用這個指令');
      return;
    }
    if (source.member.voice.channelId !== source.guild.members.me.voice.channelId) {
      await source.temp('我跟你並不在同一個語音頻道，因此你無法使用此指令');
      return;
    }

    await source.client.music.resend(source.guild.id).then(() => {
      source.temp('音樂遙控器已重新傳送');
    }).catch(() => {
      source.temp('現在沒有任何遙控器，請問我要怎麼重傳一個');
    });
  }
}