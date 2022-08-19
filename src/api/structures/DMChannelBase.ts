import { APIDMChannelBase, ChannelType } from "../types/types";
import { ChannelBase, Client } from ".";
import { TextBasedChannel } from "../types/interfaces";

export abstract class DMChannelBase<T extends ChannelType> extends ChannelBase<T> implements TextBasedChannel {
  public lastMessageId?: string | null;
  
  constructor(client: Client, data: APIDMChannelBase<T>) {
    super(client, data);
    
    this.lastMessageId = data.last_message_id;
  }

  // public async send(options: MessageOptions): Promise<Message> {}
  // public async sendTyping(): Promise<void> {}
  // public async createMessageCollector(options = {}) {}
  // public async awaitMessages(options = {}) {}
  // public async createMessageComponentCollector(options = {}) {}
  // public async awaitMessageComponent(options = {}) {}
  // public async bulkDelete(messages, filterOld = false) {}
  // public async fetchWebhooks() {}
  // public async createWebhook(options) {}
}