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

import { Message, MessageCreateOptions } from "discord.js";
import randomElement from "../features/utils/randomElement";
import randomInt from "../features/utils/randomInt";
import { Promisable } from "../typings/utils";

/**
 * 一個隱藏指令的藍圖
 * @abstract
 */
export abstract class HiddenCommand {
  /**
   * 指令的名稱
   */
  public name: string;

  /**
   * 判斷訊息是否符合隱藏指令的執行條件
   * @param message 來源訊息
   * @return 是否通過條件
   */
  public abstract filter(message: Message): boolean;

  /**
   * 執行隱藏指令
   * @param message 來源訊息
   * @return 是否成功發送回覆
   */
  public abstract execute(message: Message): Promisable<boolean>;

  /**
   * 建立一個隱藏指令
   * @param name 指令名稱
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * 給出二元回應，彩蛋回應出現的機率只有 0.2%，正常回應則有 99.8%
   * @param message 來源訊息
   * @param notEpic 正常回應
   * @param epic 彩蛋回應
   * @returns 是否成功回應（必定為 `true`）
   */
  protected epicResponse(message: Message, notEpic: (string | MessageCreateOptions)[], epic: (string | MessageCreateOptions)[]): true {
    message.channel.send(
      randomInt(1, 1000) <= 2 ?
        randomElement(epic) :
        randomElement(notEpic)
    );
    return true;
  }

  /**
   * 給出隨機回應，但沒有回應的機率比較高
   * @param message 來源訊息
   * @param responses 所有回應的集合，參數駐標越大的回應被抽出的機率越低，如果某項參數是 `null`，那抽到該項時不會有任何回應
   * @returns 是否成功回應
   */
  protected rareResponse(message: Message, ...responses: ((string | MessageCreateOptions)[] | null)[]): boolean {
    return this.randomResponse(message, null, ...responses);
  }

  /**
   * 給出隨機回應
   * @param message 來源訊息
   * @param responses 所有回應的集合，參數駐標越大的回應被抽出的機率越低，如果某項參數是 `null`，那抽到該項時不會有任何回應
   * @returns 是否成功回應
   */
  protected randomResponse(message: Message, ...responses: ((string | MessageCreateOptions)[] | null)[]): boolean {
    const random = Math.random();
    const mappedRandom = random / (11 - 10 * random);
    const index = Math.trunc(mappedRandom * responses.length);

    const group = responses[index];
    if (!group) return false;

    let response = randomElement(group);
    if (typeof response === 'string') {
      response = response.replaceAll('%u', message.author.toString());
    }
    else {
      response.content = response.content?.replaceAll('%u', message.author.toString());
    }
    message.channel.send(response);

    return true;
  }
}
