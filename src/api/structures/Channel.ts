import { Client } from ".";
import { APIChannel, ChannelType, Snowflake } from "../types/types";

export class Channel {
  public client: Client;
  public id: Snowflake;
  public type: ChannelType;

  constructor(client: Client, data: APIChannel) {
    this.client = client;
    this.id = data.id;
    this.type = data.type;
  }
}