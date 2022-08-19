import { CategoryChannel, DMChannel, GroupDMChannel, GuildStageVoiceChannel, GuildVoiceChannel, NewsChannel, TextChannel, ThreadChannel } from "../structures";

export type Awaitable<T> = T | Promise<T>;

export type Channel = CategoryChannel | DMChannel | GroupDMChannel | GuildStageVoiceChannel | GuildVoiceChannel | NewsChannel | TextChannel | ThreadChannel;

export type CollectorEndReason = 'time' | 'idle' | 'max' | 'user' | 'channelDelete' | 'guildDelete' | 'threadDelete';

export * from "discord-api-types/v10";