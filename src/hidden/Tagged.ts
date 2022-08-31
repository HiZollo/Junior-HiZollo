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

import { Message } from "discord.js";
import config from "@root/config";
import { HiddenCommand } from "../classes/HiddenCommand";

export default class Tagged extends HiddenCommand {
  constructor() {
    super('tagged');
  }

  public filter(message: Message): boolean {
    return !!message.client.user && message.author.id !== message.client.user.id &&
      message.mentions.has(message.client.user, { ignoreRoles: true, ignoreEveryone: true });
  }

  private r1 = [
    '蛤', '蝦', '嘿', '嗨', 'a', 'A', 'huh', 'hey', 'heyyyi', 'hi', 'hello', 'wut?', 'yesss',
    '怎樣', '蛤？', '是在', '幹嘛', 'what??', 'yeah?', 'hmmm...', 'well...?', '🤔', '<:pingsock:771033739157045299>',
    '又怎樣', '要幹嘛', '有事ㄇ', '有事嗎', '我不在', '？', '？？', '?', '?????', 'what\'s wrong', 'wut happened',
    '找我幹嘛', '有事情嗎', '又怎麼了', '又要幹嘛', '是在哈囉', '有事快說', '有問題嗎', '有問題ㄇ',
    '好累，怎樣', '找我有事嗎', 'Tag 我有事嗎', 'tag 我有事嗎', '被發現我在這裡了', '有重要的事嗎？',
    `吵死了 %u`, `咦，是 %u 找我嗎？`, `是 %u ping 我嗎？`,
    '沒事請不要一直@我，很煩躁', '我看到有人 tag 我，是誰啊', '我現在沒空，稍等一秒再找我吧',
    `Tag 我不能代替前綴喔，請使用 \`${config.bot.prefix}help\``, { files: ['./src/pictures/tagged.png'] }
  ];

  public execute(message: Message): boolean {
    this.randomResponse(message, this.r1);
    return true;
  }
}