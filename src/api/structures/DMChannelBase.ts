import { ChannelType } from "../types/types";
import { ChannelBase } from ".";
import { ChannelUtil } from "../utils";

export abstract class DMChannelBase<T extends ChannelType> extends ChannelUtil.ApplyTextBased(ChannelBase)<T> {
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