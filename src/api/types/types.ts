import { CategoryChannel, DMChannel, GroupDMChannel, GuildStageVoiceChannel, GuildVoiceChannel, NewsChannel, TextChannel, ThreadChannel } from "../structures";

export type Channel = CategoryChannel | DMChannel | GroupDMChannel | GuildStageVoiceChannel | GuildVoiceChannel | NewsChannel | TextChannel | ThreadChannel;

export * from "discord-api-types/v10";