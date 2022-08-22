import { APIChannel, APIInteraction, APIPingInteraction, APIUnavailableGuild, GatewayGuildCreateDispatchData, GatewayIntentBits, GatewayMessageCreateDispatchData } from "../../types/types";
import { REST } from "@discordjs/rest";
import { WebSocketShardEvents, WebSocketManager } from "@discordjs/ws";
import { EventEmitter } from "node:events";
import { ClientOptions } from "../../types/interfaces";
import { ClientEvents } from "../../types/enum";
import { GuildManager } from "..";
import { ActionManager } from "./ActionManager";

export type ClientEventsMap = {
  [ClientEvents.Ready]: [shardId: number];
  [ClientEvents.MessageCreate]: [rawMessage: GatewayMessageCreateDispatchData];
  [ClientEvents.InteractionCreate]: [rawInteraction: Exclude<APIInteraction, APIPingInteraction>];
  [ClientEvents.GuildCreate]: [rawGuild: GatewayGuildCreateDispatchData];
  [ClientEvents.ChannelDelete]: [rawChannel: APIChannel];
  [ClientEvents.ThreadDelete]: [rawThread: APIChannel];
  [ClientEvents.GuildDelete]: [rawGuild: APIUnavailableGuild];
}

export class Client extends EventEmitter {
  public id: string;
  public token!: string
  public intents: GatewayIntentBits;

  public rest: REST;
  public ws: WebSocketManager;

  public actions: ActionManager;
  public guilds: GuildManager;

  constructor(options: ClientOptions) {
    super();

    Object.defineProperty(this, 'token', { value: options.token })

    this.id = options.id;
    this.intents = options.intents;

    this.rest = new REST().setToken(this.token);
    this.ws = new WebSocketManager({
      token: this.token, 
      intents: this.intents, 
      rest: this.rest
    });

    this.onReady = this.onReady.bind(this);

    this.actions = new ActionManager(this);
    this.guilds = new GuildManager(this);
  }

  public async login(): Promise<void> {
    this.ws.on(WebSocketShardEvents.Dispatch, this.actions.handle);
    this.ws.on(WebSocketShardEvents.Ready, this.onReady);
  
    try {
      await this.ws.connect();
    } catch (error) {
      this.ws.destroy();
      throw error;
    }
  }

  public adjustMaxListener(delta: number): void {
    const count = this.getMaxListeners();
    if (count !== 0 && count + delta > 0) {
      this.setMaxListeners(count + delta);
    }
  }

  private onReady(param: { shardId: number }): void {
    this.emit(ClientEvents.Ready, param.shardId);
  }

  public override emit<K extends keyof ClientEventsMap>(event: K, ...args: ClientEventsMap[K]): boolean {
    return super.emit(event, ...args);
  }

  public override on<K extends keyof ClientEventsMap>(event: K, listener: (...args: ClientEventsMap[K]) => void): this {
    return super.on(event, listener as (...args: any[]) => void);
  }

  public override off<K extends keyof ClientEventsMap>(event: K, listener: (...args: ClientEventsMap[K]) => void): this {
    return super.off(event, listener as (...args: any[]) => void);
  }
}