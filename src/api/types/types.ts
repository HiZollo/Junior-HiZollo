import * as API from "discord-api-types/v10";
import { ButtonBuilder, LinkButtonBuilder, SelectMenuBuilder, TextInputBuilder } from "../builder";
import { AutocompleteInteraction, ButtonInteraction, CategoryChannel, ChatInputInteraction, DMChannel, GroupDMChannel, GuildForumChannel, GuildStageVoiceChannel, GuildVoiceChannel, MessageInteraction, ModalSubmitInteraction, NewsChannel, SelectMenuInteraction, TextChannel, ThreadChannel, UserInteraction } from "../structures";
import { ClientEvents, CollectorEvents } from "./enum";

export type Awaitable<T> = T | Promise<T>;

export type If<T extends boolean, A, B = null> = T extends true ? A : T extends false ? B : A | B;

export type ClientEventsMap = {
  [ClientEvents.ChannelDelete]: [rawChannel: API.GatewayChannelDeleteDispatchData];
  [ClientEvents.ChannelUpdate]: [rawChannel: API.GatewayChannelUpdateDispatchData];
  [ClientEvents.GuildCreate]: [rawGuild: API.GatewayGuildCreateDispatchData];
  [ClientEvents.GuildDelete]: [rawGuild: API.GatewayGuildDeleteDispatchData];
  [ClientEvents.GuildRoleCreate]: [rawRole: API.GatewayGuildRoleCreateDispatchData];
  [ClientEvents.GuildRoleDelete]: [rawRole: API.GatewayGuildRoleDeleteDispatchData];
  [ClientEvents.GuildRoleUpdate]: [rawRole: API.GatewayGuildRoleUpdateDispatchData];
  [ClientEvents.GuildUpdate]: [rawGuild: API.GatewayGuildUpdateDispatchData];
  [ClientEvents.InteractionCreate]: [rawInteraction: Exclude<API.GatewayInteractionCreateDispatchData, API.APIPingInteraction>];
  [ClientEvents.MessageCreate]: [rawMessage: API.GatewayMessageCreateDispatchData];
  [ClientEvents.MessageDelete]: [rawMessage: API.GatewayMessageDeleteDispatchData];
  [ClientEvents.Ready]: [shardId: number];
  [ClientEvents.ThreadDelete]: [rawThread: API.GatewayThreadDeleteDispatchData];
}

export type CollectorEventsMap<K, V> = {
  [CollectorEvents.Collect]: [V, K];
  [CollectorEvents.End]: [Map<K, V>, CollectorEndReason];
}

export type Channel = CategoryChannel | DMChannel | GroupDMChannel | GuildStageVoiceChannel | GuildVoiceChannel | NewsChannel | TextChannel | ThreadChannel | GuildForumChannel;

export type Interaction = AutocompleteInteraction | ChatInputInteraction | MessageInteraction | UserInteraction | ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction;

export type CollectorInteraction = ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction;

export type CollectorInteractionTypes = API.InteractionType.MessageComponent | API.InteractionType.ModalSubmit;

export type CollectorComponentTypes = API.ComponentType.Button | API.ComponentType.SelectMenu;

export type CollectorEndReason = 'time' | 'idle' | 'max' | 'user' | 'messageDelete' | 'channelDelete' | 'guildDelete' | 'threadDelete';

export type PermissionResolvable = bigint | string | PermissionStrings | PermissionResolvable[];

export type PermissionStrings = keyof typeof API.PermissionFlagsBits;

export type ActionRowComponentBuilder = ButtonBuilder | LinkButtonBuilder | SelectMenuBuilder | TextInputBuilder;

export * from "discord-api-types/v10";