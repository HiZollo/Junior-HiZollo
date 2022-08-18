import { GatewayDispatchEvents, GatewayDispatchPayload, GatewayIntentBits } from "../types/types";
import { REST } from "@discordjs/rest";
import { WebSocketShardEvents, WebSocketManager } from "@discordjs/ws";
import { EventEmitter } from "node:events";
import { ClientOptions } from "../types/interfaces";
import { Message } from "./Message";
import { ClientEvents } from "../types/enum";

export class Client extends EventEmitter {
  public options: ClientOptions;
  public token: string
  public intents: GatewayIntentBits;

  public rest: REST;
  public ws: WebSocketManager;

  constructor(options: ClientOptions) {
    super();
    this.options = options;
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
        this.emit('MessageCreate', new Message(this, data));
        break;
    }
  }
}