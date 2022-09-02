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
import constant from "../constant.json";
import getActivity from "../features/utils/getActivity";
import { HZClientOptions } from "../utils/interfaces";
import { ClientMusicManager } from "../classes/Music/Model/ClientMusicManager";
import { HZNetwork } from "./HZNetwork";
import { AutocompleteManager } from "./AutocompleteManager";
import { ButtonManager } from "./ButtonManager";
import { SelectMenuManager } from "./SelectMenuManager";
import { WebhookLogger } from "./WebhookLogger";
import randomElement from "../features/utils/randomElement";
import randomInt from "../features/utils/randomInt";
import { Translator } from "./Translator";
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
  private readonly ReactConstant = 10261;

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
   * 附加指令的前綴
   */
  private readonly addonPrefix = '?';

  /**
   * 執行附加指令
   * @param message 訊息來源
   * @returns 傳送出的訊息
   */
  public async addonCommand(message: Message): Promise<Message | void> {
    if (message.guild?.id !== constant.mainGuild.id) return;
    if (message.author.blocked || message.author.bot) return;
    if (!message.content.startsWith(this.addonPrefix)) return;

    const [command] = message.content.slice(this.addonPrefix.length).trim().split(/ +/, 1);
    switch (command) {
      case 'rule1': case 'r1': case 'tag':
        return message.channel.send('請不要隨意 tag 其他使用者，若是請求幫助也不要 tag 太多次');
      
      case 'offline': case 'ol': 
        return message.channel.send('每個月的最後一個週末是定期下線維護日，該日若沒有上線是正常的');
      
      case 'networksync': case 'ns': case 'network': 
        return message.channel.send(`若 Network 沒有正常同步，請先確認你的頻道名稱。如果還是不行，請檢查 HiZollo 有沒有 __${Translator.getPermissionChinese('ManageWebhooks')}__ 的權限`);
      
      case 'cantuse': case 'cu': 
        return message.channel.send('**我們不會通靈**\n如果不能使用，請報上那個指令的名稱，你的使用方式，最好能附上時間點，方便我們查詢記錄');
      
      case 'howtouse': case 'htu': case 'help':
        return message.channel.send(`請使用 \`${config.bot.prefix}help [指令名稱]\` 查詢一個指令的使用方法，裡面都有說明、用法、範例\n若還是不懂，請說明哪裡看不懂`);

      case '[]<>': case '[]': case '<>': case 'bracket': 
        return message.channel.send('使用指令時，請不要將括號（\`[]<>\`）一同輸入\n\`[]\`符號表示這個參數必填，\`<>\`則是不必填');
      
      case 'changelog': case 'cl': case 'update': 
        return message.channel.send(
          `我們的最新更新都會顯示在 \`${config.bot.prefix}ann\` 指令跳出來的清單中\n`+
          `若想了解之前的更新，可以用 \`${config.bot.prefix}links\` 取得更新日誌的連結`
        );
      
      case 'blockuser': case 'block':
        return message.channel.send('**我們會對不當使用及屢勸不聽的使用者進行處置**\n若你被加入封鎖名單中，直到解封前，你將無法主動使用 HiZollo 的任何功能');

      case '3partytool': case '3pt': 
        return message.channel.send(
          '歡迎在這邊討論任何跟 Discord 機器人製作等相關的問題，團隊成員若是有會回答的也都會分享\n'+
          '只是我們是直接寫程式運行，若是使用第三方製作軟件，可能會有我們無法解決的問題'
        );
      
      case 'selfbot': case 'sb':
        return message.channel.send(
          '歡迎在這邊討論任何跟 Discord 機器人製作等相關的問題，團隊成員若是有會回答的也都會分享\n'+
          '但有關 selfbot 等違反 Disocrd 政策的東西不在我們的回答範圍內，嚴重者也會被我們永久停權'
        );
      
      case 'python': case 'py':
        return message.channel.send('Python 在這裡是禁語，不能討論的，他是絕對的邪教。在這裡討論有關 Python 的事情都有可能遭受極大的懲罰').then(msg => {
          setTimeout(() => { msg.edit(msg.content.replace(/Python/g, '[敏感字詞已和諧]')) }, 1900);
        });
      
      case 'database': case 'db':
        return message.channel.send(
          'HiZollo 是沒有使用到有關資料庫的技術的，也就是他沒有辦法儲存任何資料，一但離線就會消失。\n'+
          '因為這個問題 HiZollo 現在無法做到像是經驗值系統、個別伺服器設定等'
        );

      case '24/7': case '247': 
        return message.channel.send('HiZollo 是在 heroku 上代管的，才能做到幾乎 24/7 上線');
      
      case 'opensource': case 'os':
        return message.channel.send('HiZollo 的 專案是開源的，你可以到 https://github.com/HiZollo/Junior-HiZollo 查看原始碼');
      
      case 'otherbot': case 'ob': 
        return message.channel.send(
          '我們官方不支援「其他機器人」使用上的教學以及問題排除，'+
          '你可以在這邊找其他熟悉機器人的人來操作，但不要 tag 團隊成員，這不是他們的工作內容'
        );
      
      case 'spoonfeed': case 'sf': case 'google':
        return message.channel.send('有些問題請自行 Google，不要當伸手牌，真正不能解決的問題再發問');
      
      case 'notdeleted': case 'nd': 
        return message.channel.send('當你發現 HiZollo 沒有把訊息刪乾淨時，其實那只是 Discord 的顯示問題，重新整理之後你就會發現訊息被刪掉了');
    }
  }
}