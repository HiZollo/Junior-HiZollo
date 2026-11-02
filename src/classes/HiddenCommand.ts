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

import type { Message, MessageCreateOptions } from "discord.js";
import randomElement from "../features/utils/randomElement";
import { Promisable } from "../typings/utils";

type HiddenResponse = string | MessageCreateOptions;

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
  protected allTimeResponse(message: Message, notEpic: HiddenResponse[], epic: HiddenResponse[]): boolean {
    if (!message.channel.isSendable()) return false;

    const response = Math.random() < 0.02 ? randomElement(epic) : randomElement(notEpic);
    message.channel.send(format(message, response));
    return true;
  }

  /**
   * 機率性給出回應
   * @param message 來源訊息
   * @param common 常見回應
   * @param rare 稀有回應
   * @param epic 史詩回應
   * @returns 是否成功回應
   */
  protected partialResponse(message: Message, common: HiddenResponse[], rare: HiddenResponse[], epic: HiddenResponse[]): boolean {
    if (!message.channel.isSendable()) return false;
    
    const random = Math.random();

    let response: HiddenResponse = "";
    if (random < 0.007) {
      response = randomElement(epic);
    }
    else if (random < 0.077) {
      response = randomElement(rare);
    }
    else if (random < 0.4) {
      response = randomElement(common);
    }
    else {
      return false;
    }

    message.channel.send(format(message, response));
    return true;
  }
}

function format(message: Message, response: HiddenResponse): HiddenResponse {
  const location = message.guild?.name ?? "這裡";
  const halfwidth = /[\x21-\x7e]/;
  const formattedLocation = 
    (halfwidth.test(location[0]) ? " " : "") + location +
    (halfwidth.test(location[location.length - 1]) ? " " : "");

  if (typeof response === "string") {
    response = response.replaceAll('%u', message.author.toString());
    response = response.replaceAll('%g', formattedLocation);
  }
  else {
    response.content = response.content?.replaceAll('%u', message.author.toString());
    response.content = response.content?.replaceAll('%g', formattedLocation);
  }
  return response;
}