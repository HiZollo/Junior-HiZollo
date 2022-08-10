import { ApplicationCommandOptionType } from "discord.js";
import { CommandOptionType, CommandType } from "../utils/enums";
import { HZCommandOptionData } from "../utils/types";

/**
 * 掌管常數與字串的轉換
 * @extends null
 */
export class Translator extends null {
  /**
   * 將群組指令全名轉換為 z 指令的捷徑名稱
   * @param commandName 由群組名稱及指令名稱構成的群組指令全名
   * @returns 捷徑名稱
   */
  static getZShortcut([groupName, commandname]: [string, string]): string | void {
    if (!(groupName in this.ZShortcut)) return;
    const nextLayer = this.ZShortcut[groupName as keyof typeof this.ZShortcut];

    if (!(commandname in nextLayer)) return;
    return nextLayer[commandname as keyof typeof nextLayer];
  }

  /**
   * 將 z 指令的捷徑名稱轉換為群組指令全名
   * @param zShortcut z 指令的捷徑名稱
   * @returns 群組指令全名
   */
  static getCommandName(zShortcut: string): [string, string] | void {
    for (const groupName in this.ZShortcut) {
      const nextLayer = this.ZShortcut[groupName as keyof typeof this.ZShortcut];
      for (const commandName in nextLayer) {
        if (nextLayer[commandName as keyof typeof nextLayer] === zShortcut) {
          return [groupName, commandName];
        }
      }
    }
  }

  /**
   * 將權限的英文字串轉換為中文名稱
   * @param input 任意字串
   * @returns 權限的中文名稱
   */
  static getPermissionChinese(input: keyof typeof this.PermissionChinese): string;
  static getPermissionChinese(input: Exclude<string, keyof typeof this.PermissionChinese>): void;
  static getPermissionChinese(input: string): string | void {
    if (!(input in this.PermissionChinese)) return;
    return this.PermissionChinese[input as keyof typeof this.PermissionChinese];
  }

  /**
   * 將指令分類轉換為中文名稱
   * @param type 指令的分類
   * @returns 中文名稱
   */
  static getCommandTypeChinese(type: CommandType): string {
    return this.CommandTypeChinese[type];
  }


  /**
   * 將指令分類轉換為中文描述
   * @param type 指令的分類
   * @returns 中文描述
   */
  static getCommandTypeChineseDescription(type: CommandType): string {
    return this.CommandTypeChineseDescription[type];
  }

  /**
   * 取得指令選項的中文型別
   * @param option 選項
   * @returns 中文型別
   */
  static getCommandOptionTypeChinese(option: HZCommandOptionData): string {
    if (option.parseAs) {
      return this.CommandOptionTypeChinese[option.parseAs];
    }
    return this.ApplicationCommandOptionTypeChinese[option.type];
  }

  /**
   * z 指令的對照表
   */
  static readonly ZShortcut = Object.freeze({
    diep: {
      fact: 'f', 
      random: 'rt', 
      server: 's', 
      tank: 't', 
      wiki: 'w'
    }, 
    music: {
      join: 'j', 
      leave: 'l', 
      play: 'p', 
      playlist: 'pl', 
      remove: 'rm', 
      resend: 'rs'
    }, 
    osu: {
      best: 'bp', 
      user: 'u'
    }
  });

  /**
   * 權限－中文名稱對照表
   */
  static readonly PermissionChinese = Object.freeze({
    /* (1 <<  0) */ "CREATE_INSTANT_INVITE": "建立邀請",
    /* (1 <<  1) */ "KICK_MEMBERS": "踢出成員",
    /* (1 <<  2) */ "BAN_MEMBERS": "對成員停權",
    /* (1 <<  3) */ "ADMINISTRATOR": "管理者",
    /* (1 <<  4) */ "MANAGE_CHANNELS": "管理頻道",
    /* (1 <<  5) */ "MANAGE_GUILD": "管理伺服器",
    /* (1 <<  6) */ "ADD_REACTIONS": "新增反應",
    /* (1 <<  7) */ "VIEW_AUDIT_LOG": "檢視審核紀錄",
    /* (1 <<  8) */ "PRIORITY_SPEAKER": "優先發言者",
    /* (1 <<  9) */ "STREAM": "視訊通話",
    /* (1 << 10) */ "VIEW_CHANNEL": "檢視頻道",
    /* (1 << 11) */ "SEND_MESSAGES": "發送訊息",
    /* (1 << 12) */ "SEND_TTS_MESSAGES": "傳送文字朗讀訊息",
    /* (1 << 13) */ "MANAGE_MESSAGES": "管理訊息",
    /* (1 << 14) */ "EMBED_LINKS": "嵌入連結",
    /* (1 << 15) */ "ATTACH_FILES": "附加檔案",
    /* (1 << 16) */ "READ_MESSAGE_HISTORY": "讀取訊息歷史",
    /* (1 << 17) */ "MENTION_EVERYONE": "提及 @\u200beveryone、@\u200bhere 和所有身分組",
    /* (1 << 18) */ "USE_EXTERNAL_EMOJIS": "使用外部表情符號",
    /* (1 << 19) */ "VIEW_GUILD_INSIGHTS": "檢視 Server Insights",
    /* (1 << 20) */ "CONNECT": "連接",
    /* (1 << 21) */ "SPEAK": "說話",
    /* (1 << 22) */ "MUTE_MEMBERS": "將成員靜音",
    /* (1 << 23) */ "DEAFEN_MEMBERS": "讓成員拒聽",
    /* (1 << 24) */ "MOVE_MEMBERS": "移動成員",
    /* (1 << 25) */ "USE_VAD": "使用語音活動",
    /* (1 << 26) */ "CHANGE_NICKNAME": "更改暱稱",
    /* (1 << 27) */ "MANAGE_NICKNAMES": "管理暱稱",
    /* (1 << 28) */ "MANAGE_ROLES": "管理身分組",
    /* (1 << 29) */ "MANAGE_WEBHOOKS": "管理 Webhooks",
    /* (1 << 30) */ "MANAGE_EMOJIS_AND_STICKERS": "管理表情符號與貼圖",
    /* (1 << 31) */ "USE_APPLICATION_COMMANDS": "使用應用程式命令",
    /* (1 << 32) */ "REQUEST_TO_SPEAK": "請求發言",
    /* (1 << 33) */ "MANAGE_EVENTS": "管理活動",
    /* (1 << 34) */ "MANAGE_THREADS": "管理討論串",
    /* (1 << 35) */ "CREATE_PUBLIC_THREADS": "建立公開討論串",
    /* (1 << 36) */ "CREATE_PRIVATE_THREADS": "建立私人討論串",
    /* (1 << 37) */ "USE_EXTERNAL_STICKERS": "使用外部貼圖",
    /* (1 << 38) */ "SEND_MESSAGES_IN_THREADS": "在討論串中傳送訊息",
    /* (1 << 39) */ "USE_EMBEDDED_ACTIVITIES": "使用活動",
    /* (1 << 40) */ "MODERATE_MEMBERS": "禁言成員",
    
    /* (1 <<  0) */ "CreateInstantInvite": "建立邀請",
    /* (1 <<  1) */ "KickMembers": "踢出成員",
    /* (1 <<  2) */ "BanMembers": "對成員停權",
    /* (1 <<  3) */ "Administrator": "管理者",
    /* (1 <<  4) */ "ManageChannels": "管理頻道",
    /* (1 <<  5) */ "ManageGuild": "管理伺服器",
    /* (1 <<  6) */ "AddReactions": "新增反應",
    /* (1 <<  7) */ "ViewAuditLog": "檢視審核紀錄",
    /* (1 <<  8) */ "PrioritySpeaker": "優先發言者",
    /* (1 <<  9) */ "Stream": "視訊通話",
    /* (1 << 10) */ "ViewChannel": "檢視頻道",
    /* (1 << 11) */ "SendMessages": "發送訊息",
    /* (1 << 12) */ "SendTTSMessages": "傳送文字朗讀訊息",
    /* (1 << 13) */ "ManageMessages": "管理訊息",
    /* (1 << 14) */ "EmbedLinks": "嵌入連結",
    /* (1 << 15) */ "AttachFiles": "附加檔案",
    /* (1 << 16) */ "ReadMessageHistory": "讀取訊息歷史",
    /* (1 << 17) */ "MentionEveryone": "提及 @​everyone、@​here 和所有身分組",
    /* (1 << 18) */ "UseExternalEmojis": "使用外部表情符號",
    /* (1 << 19) */ "ViewGuildInsights": "檢視 Server Insights",
    /* (1 << 20) */ "Connect": "連接",
    /* (1 << 21) */ "Speak": "說話",
    /* (1 << 22) */ "MuteMembers": "將成員靜音",
    /* (1 << 23) */ "DeafenMembers": "讓成員拒聽",
    /* (1 << 24) */ "MoveMembers": "移動成員",
    /* (1 << 25) */ "UseVAD": "使用語音活動",
    /* (1 << 26) */ "ChangeNickname": "更改暱稱",
    /* (1 << 27) */ "ManageNicknames": "管理暱稱",
    /* (1 << 28) */ "ManageRoles": "管理身分組",
    /* (1 << 29) */ "ManageWebhooks": "管理 Webhooks",
    /* (1 << 30) */ "ManageEmojisAndStickers": "管理表情符號與貼圖",
    /* (1 << 31) */ "UseApplicationCommands": "使用應用程式命令",
    /* (1 << 32) */ "RequestToSpeak": "請求發言",
    /* (1 << 33) */ "ManageEvents": "管理活動",
    /* (1 << 34) */ "ManageThreads": "管理討論串",
    /* (1 << 35) */ "CreatePublicThreads": "建立公開討論串",
    /* (1 << 36) */ "CreatePrivateThreads": "建立私人討論串",
    /* (1 << 37) */ "UseExternalStickers": "使用外部貼圖",
    /* (1 << 38) */ "SendMessagesInThreads": "在討論串中傳送訊息",
    /* (1 << 39) */ "UseEmbeddedActivities": "使用活動",
    /* (1 << 40) */ "ModerateMembers": "禁言成員"
  });

  /**
   * 指令分類－中文名稱對照表
   */
  static readonly CommandTypeChinese: { [key in CommandType]: string } = Object.freeze({
    [CommandType.Contact]: '聯繫', 
    [CommandType.Developer]: '開發者專用', 
    [CommandType.Fun]: '娛樂', 
    [CommandType.SinglePlayerGame]: '單人遊戲', 
    [CommandType.MultiPlayerGame]: '多人遊戲', 
    [CommandType.Information]: '資訊', 
    [CommandType.Miscellaneous]: '雜項', 
    [CommandType.Network]: '聯絡網', 
    [CommandType.SubcommandGroup]: '指令群', 
    [CommandType.Utility]: '功能'
  });

  /**
   * 指令分類－中文描述對照表
   */
  static readonly CommandTypeChineseDescription: { [key in CommandType]: string } = Object.freeze({
    [CommandType.Contact]: '與 HiZollo 的開發者聯絡', 
    [CommandType.Developer]: '開發者專用指令', 
    [CommandType.Fun]: '適合在聊天室跟朋友玩樂', 
    [CommandType.SinglePlayerGame]: '讓你在沒人的凌晨三點邊吃美味蟹堡邊玩遊戲', 
    [CommandType.MultiPlayerGame]: '跟伺服器上的夥伴一起玩遊戲', 
    [CommandType.Information]: '顯示 HiZollo 的相關資訊', 
    [CommandType.Miscellaneous]: '開發者懶得分類的指令', 
    [CommandType.Network]: '查看 HiZollo 聯絡網的相關功能', 
    [CommandType.SubcommandGroup]: '集合很多指令的指令', 
    [CommandType.Utility]: 'HiZollo 多少還是會一些有用的功能好嗎'
  });

  /**
   * 選項形別－中文名稱對照表
   */
  static readonly ApplicationCommandOptionTypeChinese: { [key in ApplicationCommandOptionType]: string } = Object.freeze({
    [ApplicationCommandOptionType.Attachment]: '檔案', 
    [ApplicationCommandOptionType.Boolean]: '布林值', 
    [ApplicationCommandOptionType.Channel]: '頻道', 
    [ApplicationCommandOptionType.Integer]: '整數', 
    [ApplicationCommandOptionType.Mentionable]: '使用者或身分組', 
    [ApplicationCommandOptionType.Number]: '數字', 
    [ApplicationCommandOptionType.Role]: '身分組', 
    [ApplicationCommandOptionType.String]: '字串', 
    [ApplicationCommandOptionType.Subcommand]: '子指令', 
    [ApplicationCommandOptionType.SubcommandGroup]: '指令群', 
    [ApplicationCommandOptionType.User]: '使用者'
  });

  /**
   * 擴展的選項型別－中文名稱對照表
   */
  static readonly CommandOptionTypeChinese: { [key in CommandOptionType]: string } = Object.freeze({
    [CommandOptionType.Attachment]: '檔案', 
    [CommandOptionType.Boolean]: '布林值', 
    [CommandOptionType.Channel]: '頻道', 
    [CommandOptionType.Emoji]: '表情符號', 
    [CommandOptionType.Integer]: '整數', 
    [CommandOptionType.Member]: '伺服器成員', 
    [CommandOptionType.Mentionable]: '使用者或身分組', 
    [CommandOptionType.Number]: '數字', 
    [CommandOptionType.Role]: '身分組', 
    [CommandOptionType.String]: '字串', 
    [CommandOptionType.Subcommand]: '子指令', 
    [CommandOptionType.SubcommandGroup]: '指令群', 
    [CommandOptionType.User]: '使用者'
  });
}