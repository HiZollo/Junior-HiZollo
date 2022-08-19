import { Message } from "discord.js";
import { GatewayIntentBits } from "./types";


export interface TextBasedChannel {
  lastMessageId?: string | null;
  send(options: MessageOptions): Promise<Message>;
  sendTyping(): Promise<void>;
  createMessageCollector(options: MessageCollectorOptions): Promise<void>;
  awaitMessages(options: MessageCollectorOptions): Promise<void>;
  createMessageComponentCollector(options: MessageComponentCollectorOptions): Promise<void>;
  awaitMessageComponent(options: MessageComponentCollectorOptions): Promise<void>;
  bulkDelete(messages: string[] | number, filterOld: boolean): Promise<void>;
  fetchWebhooks(): Promise<void>;
  createWebhook(options: CreateWebhookOptions): Promise<void>;
}

export interface ClientOptions {
  token: string;
  intents: GatewayIntentBits;
}