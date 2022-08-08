import dotenv from "dotenv";
import path from "path";
import { Client, Collection, PermissionsBitField, WebhookClient } from "discord.js";
import osu from "node-osu";
import { CommandManager } from "./CommandManager";
import CooldownManager from "./CooldownManager";
import config from "../config";
import getActivity from "../features/utils/getActivity";
import { HZClientOptions } from "../utils/interfaces";
import { ClientMusicManager } from "../classes/Music/Model/ClientMusicManager";
import { HZNetwork } from "./HZNetwork";
import { AutocompleteManager } from "./AutocompleteManager";
import { ButtonManager } from "./ButtonManager";
import { SelectMenuManager } from "./SelectMenuManager";
import { WebhookLogger } from "./WebhookLogger";

dotenv.config({ path: path.join(__dirname, '../../src/.env') });

export class HZClient extends Client {
  public devMode: boolean;
  public blockedUsers: Set<string>;

  public logger: WebhookLogger;
  
  public commands: CommandManager;
  public autocomplete: AutocompleteManager;
  public buttons: ButtonManager;
  public selectmenus: SelectMenuManager;

  public cooldown: CooldownManager;
  public music: ClientMusicManager;
  public network: HZNetwork;

  public bugHook: WebhookClient;
  public suggestHook: WebhookClient;
  public replyHook: WebhookClient;

  private _invitePermissions: PermissionsBitField | null;

  constructor(options: HZClientOptions) {
    super(options);
    
    this.devMode = options.devMode ?? false;

    if (!process.env.BLOCKED_USERS) throw new Error('Blocked users not configured.');
    this.blockedUsers = new Set(eval(process.env.BLOCKED_USERS) as string[]);

    this.logger = new WebhookLogger(this);

    this.commands = new CommandManager(this);
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

    this.osuApi = new osu.Api(config.osu.apikey, {
      completeScores: true,
      parseNumeric: true
    });

    this._invitePermissions = null;
  }

  public async initialize(): Promise<void> {
    await this.commands.load(path.join(__dirname, '../commands/'));
    await this.autocomplete.load(path.join(__dirname, '../autocomplete'));
    await this.buttons.load(path.join(__dirname, '../buttons'));
    await this.selectmenus.load(path.join(__dirname, '../selectmenus'));
    await this.network.load();
    this.user?.setActivity(await getActivity(this));
  }

  public get invitePermissions(): PermissionsBitField {
    if (this._invitePermissions) return this._invitePermissions;

    const permissions = new PermissionsBitField();
    this.commands.each(command => {
      permissions.add(command.permissions?.bot ?? []);
    });
    this.commands.subcommands.each(group => {
      group.each(command => {
        permissions.add(command.permissions?.bot ?? []);
      });
    });
    permissions.add(PermissionsBitField.StageModerator);

    return this._invitePermissions = permissions;
  }

  public async guildCount(): Promise<number> {
    const counts = await this.shard?.fetchClientValues('guilds.cache.size').catch(() => {}) as (number[] | undefined);
    return counts?.reduce((acc, cur) => acc + cur, 0) ?? 0;
  }
}