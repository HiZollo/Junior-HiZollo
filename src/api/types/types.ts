import { CategoryChannel, DMChannel, GroupDMChannel, NewsChannel, TextChannel, ThreadChannel } from "../structures";

export type Awaitable<T> = T | Promise<T>;

export type If<T extends boolean, A, B = null> = T extends true ? A : T extends false ? B : A | B;

export type Channel = CategoryChannel | DMChannel | GroupDMChannel /* | GuildStageVoiceChannel | GuildVoiceChannel */ | NewsChannel | TextChannel | ThreadChannel;

export type CollectorEndReason = 'time' | 'idle' | 'max' | 'user' | 'channelDelete' | 'guildDelete' | 'threadDelete';

export * from "discord-api-types/v10";