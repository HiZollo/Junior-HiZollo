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

import { ApplicationCommandOptionData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, Collection, PermissionFlags } from "discord.js"
import { Client as Osu } from "@hizollo/osu-api";
import { AutocompleteManager } from "../classes/AutocompleteManager";
import { ButtonManager } from "../classes/ButtonManager";
import { CommandManager } from "../classes/CommandManager";
import CooldownManager from "../classes/CooldownManager";
import { HiddenCommandManager } from "../classes/HiddenCommandManager";
import { HZNetwork } from "../classes/HZNetwork";
import { ClientMusicManager } from "../classes/Music/Model/ClientMusicManager";
import { SelectMenuManager } from "../classes/SelectMenuManager";
import { WebhookLogger } from "../classes/WebhookLogger";
import { ArgumentParseType, CommandManagerRejectReason, CommandOptionType } from "./enums";
import { CommandParserOptionFailWithChoicesResult, CommandParserOptionFailWithLimitResult, CommandParserOptionFailWithPureStatusResult, CommandParserOptionPassResult, PageSystemDescriptionOptions, PageSystemEmbedFieldOptions } from "./interfaces";

export type Intersect<T, U> = { [K in (keyof T & keyof U)]: T[K] | U[K] };

export type ValueOf<T> = T[keyof T];

export type CommandParserOptionResult = 
  | CommandParserOptionPassResult
  | CommandParserOptionFailWithPureStatusResult
  | CommandParserOptionFailWithChoicesResult
  | CommandParserOptionFailWithLimitResult

export type CommandParserPassResult = { args: unknown[] } & Omit<CommandParserOptionPassResult, 'arg'>;

export type CommandParserFailResult = { index: number } & Exclude<CommandParserOptionResult, CommandParserOptionPassResult>;

export type CommandParserResult = 
  | CommandParserPassResult
  | CommandParserFailResult

export type CommandManagerRejectInfo = 
  | { reason: CommandManagerRejectReason.Angry, args: [time: number] }
  | { reason: CommandManagerRejectReason.TwoFactorRequird, args: [] }
  | { reason: CommandManagerRejectReason.BotMissingPermission, args: [missings: (keyof PermissionFlags)[]] }
  | { reason: CommandManagerRejectReason.UserMissingPermission, args: [missings: (keyof PermissionFlags)[]] }
  | { reason: CommandManagerRejectReason.InCooldown, args: [time: number] }
  | { reason: CommandManagerRejectReason.InNetwork, args: [] }
  | { reason: CommandManagerRejectReason.IllegalArgument, args: [commandName: [string, string | undefined], commandOptions: HZCommandOptionData[], result: CommandParserFailResult] };

export type HZCommandOptionData = (Exclude<ApplicationCommandOptionData,
  | ApplicationCommandSubCommandData
  | ApplicationCommandSubGroupData
> & { parseAs?: CommandOptionType, repeat?: boolean });

export type ArgumentParseMethod = 
  | { type: ArgumentParseType.None }
  | { type: ArgumentParseType.Split, separator: string }
  | { type: ArgumentParseType.Quote, quotes: [string, string] }
  | { type: ArgumentParseType.Custom, func(s: string): string[] }

export type AutocompleteData = { [key: string]: { name: string, devOnly?: boolean }[] };

export type PageSystemOptions = PageSystemDescriptionOptions | PageSystemEmbedFieldOptions;

export type ThrowBallType = "??????" | "?????????" | "?????????" | "????????????";


declare module "discord.js" {
  interface BaseChannel {
    isNetwork: () => boolean;
    isTestChannel: () => boolean;
  }

  interface Client {
    /**
     * ??????????????????????????????
     */
    devMode: boolean;

    /**
     * ????????????????????? ID
     */
    blockedUsers: Set<string>;

    /**
     * ????????????????????????
     */
    logger: WebhookLogger;
    
    /**
     * ????????????
     */
    commands: CommandManager;

    /**
     * ??????????????????
     */
    hidden: HiddenCommandManager;

    /**
     * ??????????????????
     */
    autocomplete: AutocompleteManager;

    /**
     * ??????????????????
     */
    buttons: ButtonManager;

    /**
     * ??????????????????
     */
    selectmenus: SelectMenuManager;

    /**
     * ??????????????????
     */
    cooldown: CooldownManager;

    /**
     * ??????????????????
     */
    music: ClientMusicManager;

    /**
     * Network ??????
     */
    network: HZNetwork;

    /**
     * ??????????????????????????? Webhook
     */
    bugHook: WebhookClient;

    /**
     * ??????????????????????????? Webhook
     */
    suggestHook: WebhookClient;

    /**
     * ?????????????????????????????? Webhook
     */
    replyHook: WebhookClient;

    /**
     * ??? HiZollo ?????????????????? ID???????????????
     */
    angryList: Collection<string, number>;

    /**
     * HiZollo ????????????????????????????????????
     * @param userId ??????????????????
     */
    isAngryAt(userId: string): Promise<number>;

    /**
     * ???????????????????????????
     * @param userId ??????????????????
     */
    block(userId: string): void;

    /**
     * ???????????????????????????
     * @param userId ??????????????????
     */
    unblock(userId: string): void;

    /**
     * ?????????????????????
     */
    guildCount(): Promise<number>;

    /**
     * osu! ??? API
     */
    osu: Osu;

    /**
     * ??????????????? HiZollo ????????????????????????
     */
    get invitePermissions(): PermissionsBitField;
  }

  interface EmbedBuilder {
    applyHiZolloSettings: (member: GuildMember | null, authorText: string, footerText?: string) => EmbedBuilder;
    setMemberAuthor: (member: GuildMember | null, authorText: string) => EmbedBuilder;
    setMemberFooter: (member: GuildMember | null, footerText?: string) => EmbedBuilder;
    setUserAuthor: (user: User | null, authorText: string) => EmbedBuilder;
    setUserFooter: (user: User | null, footerText?: string) => EmbedBuilder;
    setHiZolloColor: () => EmbedBuilder;
  }

  interface GuildMember {
    tag: string;
  }

  interface User {
    blocked: boolean;
  }
}
