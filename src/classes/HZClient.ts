import dotenv from "dotenv";
import path from "path";
import { ButtonInteraction, Client, Collection, SelectMenuInteraction, WebhookClient } from "discord.js";
import osu from "node-osu";
import { CommandManager } from "./CommandManager";
import CooldownManager from "./CooldownManager";
import config from "../config";
import loadAutocomplete from "../features/appUtils/loadAutocomplete";
import loadButtons from '../features/appUtils/loadButtons';
import loadSelectMenus from '../features/appUtils/loadSelectMenus';
import getActivity from "../features/utils/getActivity";
import { HZClientOptions } from "../utils/interfaces";
import { AutocompleteReturnType } from "../utils/types";
import { ClientMusicManager } from "../classes/Music/Model/ClientMusicManager";
import { HZNetwork } from "./HZNetwork";

dotenv.config({ path: path.join(__dirname, '../../src/.env') });

export class HZClient extends Client {
  public devMode: boolean;
  public blockedUsers: Set<string>;
  
  public commands: CommandManager;
  public autocomplete: Collection<string, AutocompleteReturnType>;
  public buttons: Collection<string, (interaction: ButtonInteraction<"cached">) => Promise<void>>;
  public selectmenus: Collection<string, (interaction: SelectMenuInteraction<"cached">) => Promise<void>>;

  public cooldown: CooldownManager;
  public music: ClientMusicManager;
  public network: HZNetwork;

  public bugHook: WebhookClient;
  public suggestHook: WebhookClient;
  public replyHook: WebhookClient;

  constructor(options: HZClientOptions) {
    super(options);
    
    this.devMode = options.devMode ?? false;

    if (!process.env.BLOCKED_USERS) throw new Error('Blocked users not configured.');
    this.blockedUsers = new Set(eval(process.env.BLOCKED_USERS) as string[]);

    this.commands = new CommandManager(this);
    this.autocomplete = new Collection();
    this.buttons = new Collection();
    this.selectmenus = new Collection();

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
  }

  public async initialize(): Promise<void> {
    await this.commands.load(path.join(__dirname, '../commands/'));
    await this.network.load();
    await loadAutocomplete(this);
    await loadButtons(this);
    await loadSelectMenus(this);
    this.user?.setActivity(await getActivity(this));
  }
}