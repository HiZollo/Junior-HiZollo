import { APIChannel, APIInteraction, APIPingInteraction, APIUnavailableGuild, GatewayDispatchEvents, GatewayDispatchPayload, GatewayGuildCreateDispatchData, GatewayIntentBits, GatewayMessageCreateDispatchData, InteractionType } from "../types/types";
import { REST } from "@discordjs/rest";
import { WebSocketShardEvents, WebSocketManager } from "@discordjs/ws";
import { EventEmitter } from "node:events";
import { ClientOptions } from "../types/interfaces";
import { ClientEvents } from "../types/enum";
import { GuildManager } from ".";

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
    this.onDispatch = this.onDispatch.bind(this);

    this.guilds = new GuildManager(this);
  }

  public async login(): Promise<void> {
    this.ws.on(WebSocketShardEvents.Dispatch, this.onDispatch);
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

  private onDispatch(payload: { data: GatewayDispatchPayload } & { shardId: number }): void {
    const { t: event, d: data } = payload.data;

    switch (event) {
      case GatewayDispatchEvents.MessageCreate:
        this.emit(ClientEvents.MessageCreate, data);
        break;

      case GatewayDispatchEvents.ChannelDelete:
        this.emit(ClientEvents.ChannelDelete, data);
        break;

      case GatewayDispatchEvents.ThreadDelete:
        this.emit(ClientEvents.ThreadDelete, data);
        break;

      case GatewayDispatchEvents.GuildCreate:
        if (data.unavailable) break;

        const guild = this.guilds.get(data.id);
        if (guild) {
          guild.patch(data);
          break;
        }

        this.guilds.add(data);
        this.emit(ClientEvents.GuildCreate, data);
        break;

      case GatewayDispatchEvents.GuildDelete:
        this.emit(ClientEvents.GuildDelete, data);
        break;
      
      case GatewayDispatchEvents.InteractionCreate: 
        if (data.type === InteractionType.Ping) break;
        this.emit(ClientEvents.InteractionCreate, data);
        break;

      case GatewayDispatchEvents.Ready:
        console.log('hi');
        data.guilds.forEach(g => this.guilds.add(g));
    }
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