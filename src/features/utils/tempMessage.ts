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

import { Message, BaseMessageOptions, MessagePayload, TextBasedChannel } from "discord.js";

/**
 * 在指定頻道中發送訊息，並在特定秒數後刪除，如果秒數是負數則不會刪除該訊息
 * @param channel 指定頻道
 * @param messageResolvable 要發送的訊息
 * @param duration 訊息留存時間
 * @returns 送出的訊息
 */
export default async function tempMessage(channel: TextBasedChannel, messageResolvable: string | MessagePayload | BaseMessageOptions, duration: number = 5): Promise<Message> {
  const message = await channel.send(messageResolvable);
  if (duration >= 0) {
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 1000 * duration);
  }
  return message;
}
