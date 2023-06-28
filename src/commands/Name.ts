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

import { Command } from "../classes/Command";
import { Source } from "../classes/Source";
import randomElement from "../features/utils/randomElement";
import { CommandType } from "../typings/enums";

export default class Name extends Command<[]> {
  constructor() {
    super({ 
      type: CommandType.Information, 
      name: 'name', 
      description: '我叫什麼名字呢？真是個好問題呢'
    });
  }

  public async execute(source: Source): Promise<void> {
    await source.defer();
    await source.update(randomElement(this.names));
  }

  private names = [
    '我叫 Junior HiZollo，你呢？',
    '我的名字是 Junior HiZollo，很高興認識你！',
    'Junior HiZollo',
    '就是 Junior HiZollo 喔，有看到我的名字嗎？',
    '我叫 Junior HiZollo 啦',
    '你好，我是 Junior HiZollo',
    'My name is Junior HiZollo.',
    '吾乃揪你耳 ‧ 還揍羅是也',
    'Junior HiZollo，一個機器人',
    '我是 Junior HiZollo',
    '我是 Junior HiZollo，這世界上最強的 bot'
  ];
}
