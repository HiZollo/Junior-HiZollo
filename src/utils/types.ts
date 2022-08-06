import { ApplicationCommandOptionData, ApplicationCommandSubCommandData, ApplicationCommandSubGroupData, Collection, PermissionFlags } from "discord.js"
import osu from "node-osu";
import { AutocompleteManager } from "../classes/AutocompleteManager";
import { ButtonManager } from "../classes/ButtonManager";
import { CommandManager } from "../classes/CommandManager";
import CooldownManager from "../classes/CooldownManager";
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
  | { reason: CommandManagerRejectReason.IllegalArgument, args: [commandOptions: HZCommandOptionData[], result: CommandParserFailResult] };

export type HZCommandOptionData = (Exclude<ApplicationCommandOptionData,
  | ApplicationCommandSubCommandData
  | ApplicationCommandSubGroupData
> & { parseAs?: CommandOptionType, repeat?: boolean });

export type ArgumentParseMethod = 
  | { type: ArgumentParseType.None }
  | { type: ArgumentParseType.Split, separator: string }
  | { type: ArgumentParseType.Quote, quotes: [string, string] }
  | { type: ArgumentParseType.Custom, func(s: string): string[] }

export type AutocompleteReturnType = { [key: string]: { name: string, devOnly?: boolean }[] };

export type PageSystemOptions = PageSystemDescriptionOptions | PageSystemEmbedFieldOptions;

export type ThrowBallType = "棒球" | "保齡球" | "乒乓球" | "巧克力球";


declare module "discord.js" {
  interface BaseChannel {
    isNetwork: () => boolean;
    isTestChannel: () => boolean;
  }

  interface Client {
    autocomplete: AutocompleteManager;
    buttons: ButtonManager;
    selectmenus: SelectMenuManager;
    commands: CommandManager;
    cooldown: CooldownManager;
    music: ClientMusicManager;
    network: HZNetwork;

    devMode: boolean;
    logger: WebhookLogger;

    angryList: Collection<string, number>;
    isAngryAt(userId: string): Promise<number>;

    blockedUsers: Set<string>;
    block(userId: string): void;
    unblock(userId: string): void;

    bugHook: WebhookClient;
    suggestHook: WebhookClient;
    replyHook: WebhookClient;

    osuApi: osu.Api;

    invitePermissions: PermissionsBitField;
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
