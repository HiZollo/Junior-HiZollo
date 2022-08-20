import { MessageUtil } from ".";
import { AutocompleteInteraction, ButtonInteraction, ChatInputInteraction, Client, Message, MessageInteraction, ModalSubmitInteraction, SelectMenuInteraction, UserInteraction } from "../structures";
import { BaseMessageOptions, InteractionDeferOptions, InteractionReplyOptions, RepliableInteraction } from "../types/interfaces";
import { APIChatInputApplicationCommandInteraction, APIInteraction, APIMessage, APIMessageApplicationCommandInteraction, APIMessageComponentButtonInteraction, APIMessageComponentSelectMenuInteraction, APIPingInteraction, APIUserApplicationCommandInteraction, ApplicationCommandType, ComponentType, Interaction, InteractionResponseType, InteractionType, MessageFlags, Routes } from "../types/types";

export class InteractionUtil extends null {
  static createInteraction(client: Client, data: Exclude<APIInteraction, APIPingInteraction>): Interaction {
    switch (data.type) {
      case InteractionType.ApplicationCommand:
        switch (data.data.type) {
          case ApplicationCommandType.ChatInput:
            return new ChatInputInteraction(client, data as APIChatInputApplicationCommandInteraction);
          
          case ApplicationCommandType.Message:
            return new MessageInteraction(client, data as APIMessageApplicationCommandInteraction);
          
          case ApplicationCommandType.User:
            return new UserInteraction(client, data as APIUserApplicationCommandInteraction);
        }
      
      case InteractionType.ApplicationCommandAutocomplete:
        return new AutocompleteInteraction(client, data);

      case InteractionType.MessageComponent:
        switch (data.data.component_type) {
          case ComponentType.Button:
            return new ButtonInteraction(client, data as APIMessageComponentButtonInteraction);
          
          case ComponentType.SelectMenu:
            return new SelectMenuInteraction(client, data as APIMessageComponentSelectMenuInteraction);
        }

      case InteractionType.ModalSubmit:
        return new ModalSubmitInteraction(client, data);
    }
  }

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

      public async deferReply(options: InteractionDeferOptions & { fetchReply: true }): Promise<Message>;
      public async deferReply(options?: InteractionDeferOptions): Promise<void>;
      public async deferReply(options: InteractionDeferOptions = {}): Promise<Message | void> {
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

        return options.fetchReply ? this.fetchReply() : undefined;
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

      public async followUp(options: InteractionReplyOptions | string): Promise<Message> {
        if (!this.deferred && !this.replied) throw new Error('This interaction has not been deferred or replied.');
        
        const body = typeof options === 'string' ? { content: options } : MessageUtil.resolveBody(options);
        const files = typeof options === 'string' ? [] : await MessageUtil.resolveFiles(options.files ?? []);

        const data = await this.client.rest.post(Routes.webhook(this.applicationId, this.token), { body, files, auth: false }) as APIMessage;
        this.replied = true;

        return new Message(this.client, data);
      }
    }
    return RepliableBase;
  }
}