import { GatewayDispatchEvents, GatewayDispatchPayload, GatewayIntentBits } from "../types/types";
import { REST } from "@discordjs/rest";
import { WebSocketShardEvents, WebSocketManager } from "@discordjs/ws";
import { EventEmitter } from "node:events";
import { ClientOptions } from "../types/interfaces";
import { ClientEvents } from "../types/enum";

export class Client extends EventEmitter {
  public token: string
  public intents: GatewayIntentBits;

  public rest: REST;
  public ws: WebSocketManager;

  constructor(options: ClientOptions) {
    super();
    this.token = options.token;
    this.intents = options.intents;

    this.rest = new REST().setToken(this.token);
    this.ws = new WebSocketManager({
      token: this.token, 
      intents: this.intents, 
      rest: this.rest
    });

    this.onReady = this.onReady.bind(this);
    this.onDispatch = this.onDispatch.bind(this);
  }

  public async login(): Promise<void> {
    this.ws.on(WebSocketShardEvents.Ready, this.onReady);
    this.ws.on(WebSocketShardEvents.Dispatch, this.onDispatch);
  
    try {
      await this.ws.connect();
    } catch (error) {
      this.ws.destroy();
      throw error;
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

      case GatewayDispatchEvents.GuildDelete:
        this.emit(ClientEvents.GuildDelete, data);
        break;
    }
  }
}