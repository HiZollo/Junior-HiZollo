import { PermissionFlagsBits } from "discord.js";
import { ButtonBuilder, LinkButtonBuilder, SelectMenuBuilder, TextInputBuilder } from "../builder";
import { AutocompleteInteraction, ButtonInteraction, CategoryChannel, ChatInputInteraction, DMChannel, GroupDMChannel, MessageInteraction, ModalSubmitInteraction, NewsChannel, SelectMenuInteraction, TextChannel, ThreadChannel, UserInteraction } from "../structures";

export type Awaitable<T> = T | Promise<T>;

export type If<T extends boolean, A, B = null> = T extends true ? A : T extends false ? B : A | B;

export type Channel = CategoryChannel | DMChannel | GroupDMChannel /* | GuildStageVoiceChannel | GuildVoiceChannel */ | NewsChannel | TextChannel | ThreadChannel;

export type Interaction = AutocompleteInteraction | ChatInputInteraction | MessageInteraction | UserInteraction | ButtonInteraction | SelectMenuInteraction | ModalSubmitInteraction;

export type CollectorEndReason = 'time' | 'idle' | 'max' | 'user' | 'channelDelete' | 'guildDelete' | 'threadDelete';

export type PermissionResolvable = bigint | string | PermissionStrings | PermissionResolvable[];

export type PermissionStrings = keyof typeof PermissionFlagsBits;

export type ActionRowComponentBuilder = ButtonBuilder | LinkButtonBuilder | SelectMenuBuilder | TextInputBuilder;

export * from "discord-api-types/v10";