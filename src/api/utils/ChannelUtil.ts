import { MessageUtil } from ".";
import { CategoryChannel, Client, DMChannel, GroupDMChannel, GuildForumChannel, GuildStageVoiceChannel, GuildVoiceChannel, InteractionCollector, Message, MessageCollector, NewsChannel, TextChannel, ThreadChannel } from "../structures";
import { CollectorEvents } from "../types/enum";
import { CollectorInteractionTypeMap, CollectorOptions, InteractionCollectorOptions, ITextBasedChannel, TextBasedChannelSendOptions } from "../types/interfaces";
import { APIChannel, APIMessage, Channel, ChannelType, CollectorComponentTypes, InteractionType, Routes } from "../types/types";

export class ChannelUtil extends null {
  static createChannel(client: Client, data: APIChannel): Channel {
    switch (data.type) {
      case ChannelType.DM:
        return new DMChannel(client, data);
      
      case ChannelType.GroupDM:
        return new GroupDMChannel(client, data);
      
      case ChannelType.GuildCategory:
        return new CategoryChannel(client, data);
      
      // case ChannelType.GuildDirectory:
      //   return new DirectoryChannel(client, data);
      
      case ChannelType.GuildForum:
        return new GuildForumChannel(client, data);
      
      case ChannelType.GuildNews:
        return new NewsChannel(client, data);
      
      case ChannelType.GuildNewsThread:
      case ChannelType.GuildPrivateThread:
      case ChannelType.GuildPublicThread:
        return new ThreadChannel(client, data);
      
      case ChannelType.GuildStageVoice:
        return new GuildStageVoiceChannel(client, data);
      
      case ChannelType.GuildText:
        return new TextChannel(client, data);
      
      case ChannelType.GuildVoice:
        return new GuildVoiceChannel(client, data);
    }
  }

  static ApplyTextBased<T extends abstract new (...args: any[]) => { client: Client, id: string, guildId?: string | null }>(Base: T) {
    abstract class BaseWithTextBased extends Base implements ITextBasedChannel {
      public async send(message: TextBasedChannelSendOptions | string): Promise<Message> {
        const body = typeof message === 'string' ? { content: message } : MessageUtil.resolveBody(message);
        const files = typeof message === 'string' ? [] : await MessageUtil.resolveFiles(message.files ?? []);
    
        const data = await this.client.rest.post(Routes.channelMessages(this.id), { body, files }) as APIMessage;
        return new Message(this.client, data);
      }

      public createMessageCollector(options: CollectorOptions): MessageCollector {
        return new MessageCollector({ channelId: this.id, guildId: this.guildId ?? undefined, ...options });
      }

      public awaitMessages(options: CollectorOptions): Promise<Map<string, APIMessage>> {
        return new Promise(resolve => {
          this.createMessageCollector(options).on(CollectorEvents.End, resolve);
        });
      }
      
      public createComponentCollector<T extends CollectorComponentTypes>(
        options: { componentType: T } & Omit<InteractionCollectorOptions, "interactionType" | "messageId" | "channelId" | "guildId">
      ): InteractionCollector<CollectorInteractionTypeMap[T]> {
        return new InteractionCollector({ channelId: this.id, guildId: this.guildId ?? undefined, interactionType: InteractionType.MessageComponent , ...options });
      }

      public awaitComponents<T extends CollectorComponentTypes>(
        options: { componentType: T } & Omit<InteractionCollectorOptions, "interactionType" | "messageId" | "channelId" | "guildId">
      ): Promise<Map<string, CollectorInteractionTypeMap[T]>> {
        return new Promise(resolve => {
          this.createComponentCollector(options).on(CollectorEvents.End, resolve);
        });
      }
    }

    return BaseWithTextBased;
  }
}
