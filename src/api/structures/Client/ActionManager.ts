import { Client } from "..";
import { GatewayDispatchPayload } from "../../types/types";
import { Actions } from "./Actions";

export class ActionManager {
  public client: Client;
  private actions: typeof Actions;

  constructor(client: Client) {
    this.client = client;
    this.actions = Actions;
  }

  public handle(payload: { data: GatewayDispatchPayload, shardId: number }): void {
    const { t: event, d: data } = payload.data;
    if (!(event in Actions)) return;


    // @ts-ignore
    this.actions[event as keyof typeof Actions]?.(this.client, data);

    // switch (event) {
    //   case GatewayDispatchEvents.ChannelDelete:
    //     this.client.emit(ClientEvents.ChannelDelete, data);
    //     break;

    //   case GatewayDispatchEvents.ThreadDelete:
    //     this.client.emit(ClientEvents.ThreadDelete, data);
    //     break;

    //   case GatewayDispatchEvents.GuildCreate:
    //     if (data.unavailable) break;

    //     const guild = this.client.guilds.get(data.id);
    //     if (guild) {
    //       guild.patch(data);
    //       break;
    //     }

    //     this.client.guilds.add(data);
    //     this.client.emit(ClientEvents.GuildCreate, data);
    //     break;

    //   case GatewayDispatchEvents.GuildDelete:
    //     this.client.emit(ClientEvents.GuildDelete, data);
    //     break;

    //   case GatewayDispatchEvents.Ready:
    //     console.log('hi');
    //     data.guilds.forEach(g => this.client.guilds.add(g));
    // }
  }
}