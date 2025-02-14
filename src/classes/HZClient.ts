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

import path from "node:path";
import { Client, Collection, Message, MessageReaction, PermissionFlagsBits, PermissionsBitField, WebhookClient } from "discord.js";
import { Client as Osu } from "@hizollo/osu-api";
import { CommandManager } from "./CommandManager";
import CooldownManager from "./CooldownManager";
import config from "@root/config";
import constant from "@root/constant.json";
import getActivity from "../features/utils/getActivity";
import { HZClientOptions } from "../typings/interfaces";
import { ClientMusicManager } from "../classes/Music/Model/ClientMusicManager";
import { HZNetwork } from "./HZNetwork";
import { AutocompleteManager } from "./AutocompleteManager";
import { ButtonManager } from "./ButtonManager";
import { SelectMenuManager } from "./SelectMenuManager";
import { WebhookLogger } from "./WebhookLogger";
import randomElement from "../features/utils/randomElement";
import randomInt from "../features/utils/randomInt";
import { HiddenCommandManager } from "./HiddenCommandManager";

/**
 * 擴展的 client
 * @extends Client
 */
export class HZClient extends Client {
  /**
   * 建立一個擴展版 client
   * @param options 
   */
  constructor(options: HZClientOptions) {
    super(options);
    
    this.devMode = options.devMode ?? false;

    if (!process.env.BLOCKED_USERS) throw new Error('Blocked users not configured.');
    this.blockedUsers = new Set(eval(process.env.BLOCKED_USERS) as string[]);

    this.logger = new WebhookLogger(this);

    this.commands = new CommandManager(this);
    this.hidden = new HiddenCommandManager(this);
    this.autocomplete = new AutocompleteManager(this);
    this.buttons = new ButtonManager(this);
    this.selectmenus = new SelectMenuManager(this);

    this.cooldown = new CooldownManager(this);
    this.music = new ClientMusicManager(this);
    this.network = new HZNetwork(this);

    this.angryList = new Collection();

    this.bugHook = new WebhookClient({ id: config.webhooks.bug.id, token: config.webhooks.bug.token });
    this.suggestHook = new WebhookClient({ id: config.webhooks.suggest.id, token: config.webhooks.suggest.token });
    this.replyHook = new WebhookClient({ id: config.webhooks.reply.id, token: config.webhooks.reply.token });

    this.osu = new Osu({ 
      apiKey: config.osu.apikey
    });
  }

  /**
   * 初始化這個 client
   */
  public async initialize(): Promise<void> {
    await this.commands.load(path.join(__dirname, '../commands/'));
    await this.hidden.load(path.join(__dirname, '../hidden'));
    await this.autocomplete.load(path.join(__dirname, '../autocomplete'));
    await this.buttons.load(path.join(__dirname, '../buttons'));
    await this.selectmenus.load(path.join(__dirname, '../selectmenus'));
    await this.network.load();
    this.user?.setActivity(await getActivity(this));
  }

  /**
   * 避免重複計算的最少量權限快取
   */
  private _invitePermissions: PermissionsBitField | null = null;
  public get invitePermissions(): PermissionsBitField {
    if (this._invitePermissions) return this._invitePermissions;

    const permissions = new PermissionsBitField();
    this.commands.each(command => {
      permissions.add(command.permissions?.bot ?? []);
    });
    this.commands.subcommands.each(group => {
      group.data.each(command => {
        permissions.add(command.permissions?.bot ?? []);
      });
    });
    permissions.add(PermissionFlagsBits.ManageWebhooks, PermissionsBitField.StageModerator);

    return this._invitePermissions = permissions;
  }

  public async guildCount(): Promise<number> {
    const counts = await this.shard?.fetchClientValues('guilds.cache.size').catch(() => {}) as (number[] | undefined);
    return counts?.reduce((acc, cur) => acc + cur, 0) ?? 0;
  }

  /**
   * 隨機反應的反應
   */
  private readonly emojiPool = ['🤔', '😶', '🤨', '😩', '🧐'];

  /**
   * 隨機反應機率的倒數
   */
  private readonly ReactConstant = 12990;

  /**
   * 對一則訊息隨機反應
   * @param message 訊息
   * @returns 成功反應時回傳該反應
   */
  public async randomReact(message: Message): Promise<MessageReaction | void> {
    if (message.author.blocked || message.author.bot) return;
    if (this.devMode && !message.channel.isTestChannel()) return;
    if (randomInt(0, this.ReactConstant - 1)) return;
    const emoji = randomElement(this.emojiPool);
    return message.react(emoji).catch(() => {});
  }

  /**
   * 需要投票功能的頻道 ID
   */
  private readonly pollChannelId = [constant.mainGuild.channels.announcementId, constant.mainGuild.channels.suggestReportId];

  /**
   * 對指定頻道中的訊息附加投票用的表情符號
   * @param message 訊息
   */
  public async poll(message: Message): Promise<void> {
    if (this.pollChannelId.includes(message.channel.id)) {
      await message.react('👍').catch(() => {});
      await message.react('👎').catch(() => {});
    }
  }

  /**
   * HiZolo 是否正在生某個使用者的氣
   * @param userId 該使用者的 ID
   */
  public async isAngryAt(userId: string): Promise<number> {
    const angry = await this.shard?.broadcastEval((c, { id }) => {
      return c.angryList.get(id);
    }, { context: { id: userId } });
    const time = angry?.find(a => a);
    const now = Date.now();

    return time && time > now ? time - now : 0;
  }

  /**
   * 暫時封鎖一名使用者
   * @param userId 該使用者的 ID
   */
  public block(userId: string): void {
    this.blockedUsers.add(userId);
  }

  /**
   * 暫時解封一名使用者
   * @param userId 該使用者的 ID
   */
  public unblock(userId: string): void {
    this.blockedUsers.delete(userId);
  }
}
