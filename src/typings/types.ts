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

export type ThrowBallType = "棒球" | "保齡球" | "乒乓球" | "巧克力球";


declare module "discord.js" {
  interface BaseChannel {
    isNetwork: () => boolean;
    isTestChannel: () => boolean;
  }

  interface Client {
    /**
     * 是否在開發模式中運行
     */
    devMode: boolean;

    /**
     * 被封鎖的使用者 ID
     */
    blockedUsers: Set<string>;

    /**
     * 重要事件的記錄器
     */
    logger: WebhookLogger;

    /**
     * 指令管家
     */
    commands: CommandManager;

    /**
     * 隱藏指令管家
     */
    hidden: HiddenCommandManager;

    /**
     * 自動匹配管家
     */
    autocomplete: AutocompleteManager;

    /**
     * 永久按鈕管家
     */
    buttons: ButtonManager;

    /**
     * 永久選單管家
     */
    selectmenus: SelectMenuManager;

    /**
     * 冷卻系統管家
     */
    cooldown: CooldownManager;

    /**
     * 音樂系統管家
     */
    music: ClientMusicManager;

    /**
     * Network 管家
     */
    network: HZNetwork;

    /**
     * 用於記錄錯誤回報的 Webhook
     */
    bugHook: WebhookClient;

    /**
     * 用於記錄建議回報的 Webhook
     */
    suggestHook: WebhookClient;

    /**
     * 用於記錄開發者回覆的 Webhook
     */
    replyHook: WebhookClient;

    /**
     * 被 HiZollo 討厭的使用者 ID－氣消時間
     */
    angryList: Collection<string, number>;

    /**
     * HiZollo 是否正在生某個使用者的氣
     * @param userId 指定的使用者
     */
    isAngryAt(userId: string): Promise<number>;

    /**
     * 暫時封鎖一名使用者
     * @param userId 指定的使用者
     */
    block(userId: string): void;

    /**
     * 暫時解封一名使用者
     * @param userId 指定的使用者
     */
    unblock(userId: string): void;

    /**
     * 取得伺服器總數
     */
    guildCount(): Promise<number>;

    /**
     * osu! 的 API
     */
    osu: Osu;

    /**
     * 要完整使用 HiZollo 所需的最少量權限
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
