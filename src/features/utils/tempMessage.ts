import { Message, MessageOptions, MessagePayload, TextBasedChannel } from "discord.js";

/**
 * 在指定頻道中發送訊息，並在特定秒數後刪除，如果秒數是負數則不會刪除該訊息
 * @param channel 指定頻道
 * @param messageResolvable 要發送的訊息
 * @param duration 訊息留存時間
 * @returns 送出的訊息
 */
export default async function tempMessage(channel: TextBasedChannel, messageResolvable: string | MessagePayload | MessageOptions, duration: number = 5): Promise<Message> {
  const message = await channel.send(messageResolvable);
  if (duration >= 0) {
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 1000 * duration);
  }
  return message;
}
