import { Collector } from ".."
import { ClientEvents } from "../../types/enum";
import { InteractionCollectorOptions } from "../../types/interfaces"
import { APIChannel, APIInteraction, APIPingInteraction, APIUnavailableGuild, CollectorComponentTypes, CollectorEndReason, CollectorInteraction, CollectorInteractionTypes, GatewayMessageDeleteDispatchData, InteractionType } from "../../types/types"
import { InteractionUtil } from "../../utils";

export class InteractionCollector<V extends CollectorInteraction> extends Collector<string, V> {
  public interactionTypes: CollectorInteractionTypes[];
  public componentTypes: CollectorComponentTypes[];
  public messageId?: string;
  public channelId?: string;
  public guildId?: string;

  constructor(options: InteractionCollectorOptions) {
    super(options);

    if (options.interactionTypes.includes(InteractionType.MessageComponent) && !options.componentTypes?.length) {
      throw new Error('You should provide at least one component type');
    }

    this.interactionTypes = options.interactionTypes;
    this.componentTypes = options.componentTypes ?? [];
    this.messageId = options.messageId;
    this.channelId = options.channelId;
    this.guildId = options.guildId;

    this.client.adjustMaxListener(1);
    this.client.on(ClientEvents.InteractionCreate, this.onCollect);

    if (this.messageId) {
      this.client.on(ClientEvents.MessageDelete, this.onMessageDelete);
    }

    if (this.channelId) {
      this.client.on(ClientEvents.ChannelDelete, this.onChannelDelete);
      this.client.on(ClientEvents.ThreadDelete, this.onThreadDelete);
    }

    if (this.guildId) {
      this.client.on(ClientEvents.GuildDelete, this.onGuildDelete);
    }
  }

  public end(reason?: CollectorEndReason): void {
    this.client.off(ClientEvents.InteractionCreate, this.onCollect);
    
    if (this.messageId) {
      this.client.off(ClientEvents.MessageDelete, this.onMessageDelete);
    }

    if (this.channelId) {
      this.client.off(ClientEvents.ChannelDelete, this.onChannelDelete);
      this.client.off(ClientEvents.ThreadDelete, this.onThreadDelete);
    }

    if (this.guildId) {
      this.client.off(ClientEvents.GuildDelete, this.onGuildDelete);
    }

    this.client.adjustMaxListener(-1);
    super.end(reason);
  }

  protected collect(rawInteraction: Exclude<APIInteraction, APIPingInteraction>): [key: string, value: V] | null {
    if (rawInteraction.type === InteractionType.ApplicationCommand || rawInteraction.type === InteractionType.ApplicationCommandAutocomplete) return null;
    if (!this.interactionTypes.includes(rawInteraction.type)) return null;
    if (rawInteraction.type === InteractionType.MessageComponent && !this.componentTypes.includes(rawInteraction.data.component_type)) return null;
    if (this.messageId && this.messageId !== rawInteraction.message?.id) return null;
    if (this.channelId && this.channelId !== rawInteraction.channel_id) return null;
    if (this.guildId && this.guildId !== rawInteraction.guild_id) return null;
    
    return [rawInteraction.id, InteractionUtil.createInteraction(this.client, rawInteraction) as V];
  }

  private onMessageDelete(rawChannel: GatewayMessageDeleteDispatchData): void {
    if (rawChannel.id === this.channelId) {
      this.end('messageDelete');
    }
  }

  private onChannelDelete(rawChannel: APIChannel): void {
    if (rawChannel.id === this.channelId) {
      this.end('channelDelete');
    }
  }

  private onGuildDelete(rawGuild: APIUnavailableGuild): void {
    if (rawGuild.id === this.guildId) {
      this.end('guildDelete');
    }
  }

  private onThreadDelete(rawThread: APIChannel): void {
    if (rawThread.id === this.channelId) {
      this.end('threadDelete');
    }
  }
}