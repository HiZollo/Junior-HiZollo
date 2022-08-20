import { MessageUtil } from ".";
import { Client, Message } from "../structures";
import { BaseMessageOptions, InteractionReplyOptions, RepliableInteraction } from "../types/interfaces";
import { APIMessage, InteractionResponseType, MessageFlags, Routes } from "../types/types";

export class InteractionUtil extends null {
  static ApplyRepliable<T extends abstract new (...args: any[]) => { client: Client, id: string, applicationId: string, token: string }>(Base: T) {
    abstract class RepliableBase extends Base implements RepliableInteraction {
      public deferred: boolean = false;
      public replied: boolean = false;
      public ephemeral: boolean = false;

      public async reply(options: InteractionReplyOptions | string): Promise<Message> {
        if (this.deferred || this.replied) throw new Error('This interaction has already been deferred or replied.');
        this.ephemeral = typeof options === 'object' && !!options.ephemeral;

        const body = typeof options === 'string' ? { content: options } : MessageUtil.resolveBody(options);
        const files = typeof options === 'string' ? [] : await MessageUtil.resolveFiles(options.files ?? []);

        await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
          body: {
            type: InteractionResponseType.ChannelMessageWithSource, 
            data: body
          }, 
          files, 
          auth: false
        });
        this.replied = true;

        return this.fetchReply();
      }

      public async deferReply(options: { ephemeral?: boolean }): Promise<Message> {
        if (this.deferred || this.replied) throw new Error('This interaction has already been deferred or replied.');
        this.ephemeral = 'ephemeral' in options && !!options.ephemeral;

        this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
          body: {
            type: InteractionResponseType.DeferredChannelMessageWithSource, 
            data: {
              flags: options.ephemeral ? MessageFlags.Ephemeral : undefined
            }
          }, 
          auth: false
        });
        this.deferred = true;

        return this.fetchReply();
      }

      public async editReply(options: BaseMessageOptions | string): Promise<Message> {
        if (!this.deferred && !this.replied) throw new Error('This interaction has not been deferred or replied.');
        
        const body = typeof options === 'string' ? { content: options } : MessageUtil.resolveBody(options);
        const files = typeof options === 'string' ? [] : await MessageUtil.resolveFiles(options.files ?? []);

        const data = await this.client.rest.patch(Routes.webhookMessage(this.applicationId, this.token), { body, files }) as APIMessage;
        this.replied = true;

        return new Message(this.client, data);
      }

      public async fetchReply(): Promise<Message> {
        const data = await this.client.rest.get(Routes.webhookMessage(this.applicationId, this.token)) as APIMessage;
        return new Message(this.client, data);
      }

      public async deleteReply(): Promise<void> {
        if (this.ephemeral) throw new Error('Ephemeral responses cannot be deleted.');
        await this.client.rest.delete(Routes.webhookMessage(this.applicationId, this.token));
      }

      public async followUp(options: InteractionReplyOptions): Promise<Message> {
        if (!this.deferred && !this.replied) throw new Error('This interaction has not been deferred or replied.');
        
        const body = typeof options === 'string' ? { content: options } : MessageUtil.resolveBody(options);
        const files = typeof options === 'string' ? [] : await MessageUtil.resolveFiles(options.files ?? []);

        const data = await this.client.rest.post(Routes.webhookMessage(this.applicationId, this.token), { body, files }) as APIMessage;
        this.replied = true;

        return new Message(this.client, data);
      }
    }
    return RepliableBase;
  }
}