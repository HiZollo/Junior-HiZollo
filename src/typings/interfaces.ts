/*
 *
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 *
 * This file is a part of Junior HiZollo.
 *
 * Junior HiZollo is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Junior HiZollo is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { ButtonBuilder, ModalBuilder } from "@discordjs/builders";
import { VoiceConnection } from "@discordjs/voice";
import { APIEmbedField, ApplicationCommandOptionChoiceData, ClientOptions, Collection, EmbedBuilder, Guild, GuildMember, GuildTextBasedChannel, Message, MessageCreateOptions, TextChannel, User, VoiceBasedChannel } from "discord.js";
import { InfoData, YouTubeStream } from "play-dl";
import { HZClient } from "../classes/HZClient";
import { Source } from "../classes/Source";
import { GuildMusicManager } from "../classes/Music/Model/GuildMusicManager";
import { MusicViewRenderer } from "../classes/Music/View/MusicViewRenderer";
import { CommandParserOptionResultStatus, CommandType, PageSystemMode } from "./enums";
import { ArgumentParseMethod, HZCommandOptionData } from "./types";
import { Command } from "../classes/Command";

export interface SubcommandGroup {
  type: CommandType.SubcommandGroup;
  name: string;
  description: string;
  aliases?: string[];
  data: Collection<string, Command>;
}

export interface HZClientOptions extends ClientOptions {
  devMode?: boolean;
}

export interface HZNetworkEvents {
  error: [error: Error];
  loaded: [];
  broadcast: [portNo: string, content: string];
  crosspost: [portNo: string, guild: Guild, author: User];
  joined: [portNo: string, channel: TextChannel];
  left: [portNo: string, channel: TextChannel];
}

export interface CommandManagerEvents {
  error: [commandName: string, error: Error];
  executed: [source: Source, commandName: [string, string | undefined], args: unknown[]];
  loaded: [];
  unavailable: [source: Source];
}

export interface HiddenCommandManagerEvents {
  executed: [message: Message, commandName: string];
}

export interface CommandParserOptionBaseResult {
  arg: unknown;
}

export interface CommandParserOptionPassResult extends CommandParserOptionBaseResult {
  status: CommandParserOptionResultStatus.Pass;
}

export interface CommandParserOptionFailWithPureStatusResult extends CommandParserOptionBaseResult {
  status: CommandParserOptionResultStatus.Required | CommandParserOptionResultStatus.WrongFormat;
}

export interface CommandParserOptionFailWithChoicesResult extends CommandParserOptionBaseResult {
  status: CommandParserOptionResultStatus.NotInChoices;
  choices: readonly ApplicationCommandOptionChoiceData[];
}

export interface CommandParserOptionFailWithLimitResult extends CommandParserOptionBaseResult {
  status: CommandParserOptionResultStatus.ValueTooSmall | CommandParserOptionResultStatus.ValueTooLarge | CommandParserOptionResultStatus.LengthTooShort | CommandParserOptionResultStatus.LengthTooLong;
  limit: number;
}

/******************* Command *******************/
export interface CommandOptions {
  type: CommandType;
  parent?: string;
  name: string;
  description: string;
  extraDescription?: string;
  aliases?: string[];
  options?: HZCommandOptionData[];
  argumentParseMethod?: ArgumentParseMethod;
  cooldown?: number;
  permissions?: CommandPermission;
}

export interface CommandPermission {
  bot?: bigint[];
  user?: bigint[];
}
/***/

export interface CooldownManagerMethodOptions {
  commandName: string;
  userId: string;
}

export interface CooldownManagerAddUserOptions extends CooldownManagerMethodOptions {
  duration?: number;
}

export interface ModelSystemContentOptions {
  start: string;
  success: string;
  exit: string;
  idle: string;
}

export interface ModelSystemOptions {
  source: Source;
  buttons: {
    open: ButtonBuilder,
    close: ButtonBuilder
  };
  modal: ModalBuilder;
  contents: ModelSystemContentOptions;
  time?: number;
}

export interface BasePageSystemOptions {
  mode: PageSystemMode;
  source: Source;
  embed: EmbedBuilder;
  description?: string;
  index?: number;
  thumbnails?: (string | null)[];
  extendFooter?: string;
  contents: {
    exit: string,
    idle: string
  };
}

export interface PageSystemPagesOptions {
  name: string;
  [key: string]: any;
}

export interface PageSystemDescriptionOptions extends BasePageSystemOptions {
  mode: PageSystemMode.Description;
  pages: PageSystemPagesOptions[][];
  allowSelect?: boolean;
}

export interface PageSystemEmbedFieldOptions extends BasePageSystemOptions {
  mode: PageSystemMode.EmbedField;
  pages: APIEmbedField[][];
}

export interface YesNoSystemOptions {
  source: Source;
  messageOptions: MessageCreateOptions;
  labels: [string, string];
  contents: {
    idle: string
  };
}

export interface GuildMusicManagerOptions {
  client: HZClient;
  view: MusicViewRenderer;
  voiceChannel: VoiceBasedChannel;
  textChannel: GuildTextBasedChannel
  connection: VoiceConnection;
  autoSuppress: boolean;
}

export interface TrackOptions {
  requester: GuildMember;
  stream: YouTubeStream;
  info: InfoData;
}

export interface GuildMusicControllerOptions {
  client: HZClient;
  channel: GuildTextBasedChannel;
  view: MusicViewRenderer;
  manager: GuildMusicManager;
}
