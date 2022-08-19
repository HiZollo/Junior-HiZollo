import { Client } from ".";
import { APIChannelBase, ChannelFlags, ChannelType, Snowflake } from "../types/types";

export abstract class ChannelBase<T extends ChannelType> {
  public client: Client;
  public type: T;
  public id: Snowflake;
  public name?: string | null;
  public flags?: ChannelFlags;

  constructor(client: Client, data: APIChannelBase<T>) {
    this.client = client;
    this.type = data.type;
    this.id = data.id;
    this.name = data.name;
    this.flags = data.flags;
  }

  // public async delete() {}
  // public async fetch() {}

  public toString(): string {
    return `<#${this.id}>`;
  }
}