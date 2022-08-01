import { Message, MessageOptions, MessagePayload, TextBasedChannel } from "discord.js";

export default async function tempMessage(channel: TextBasedChannel, messageResolvable: string | MessagePayload | MessageOptions, duration: number = 5): Promise<Message> {
  const message = await channel.send(messageResolvable);
  if (duration >= 0) {
    setTimeout(() => {
      message.delete().catch(() => {});
    }, 1000 * duration);
  }
  return message;
}
