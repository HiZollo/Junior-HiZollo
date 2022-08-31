import { Client } from "..";
import { GatewayDispatchPayload } from "../../types/types";
import { Actions } from "./Actions";

export class ActionManager {
  public client: Client;
  private actions: typeof Actions;

  constructor(client: Client) {
    this.client = client;
    this.actions = Actions;

    this.handle = this.handle.bind(this);
  }

  public handle(payload: { data: GatewayDispatchPayload, shardId: number }): void {
    const { t: event, d: data } = payload.data;
    if (!(event in Actions)) return;

    // @ts-ignore
    this.actions[event](this.client, data, payload.shardId);
  }
}