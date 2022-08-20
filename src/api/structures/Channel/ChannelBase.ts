import { Client } from "..";
import { TextBasedChannel } from "../../types/interfaces";
import { APIChannelBase, ChannelFlags, ChannelType, Routes, Snowflake } from "../../types/types";
import { SnowflakeUtil } from "../../utils";

export abstract class ChannelBase<T extends ChannelType> {
  public client!: Client;
  public type: ChannelType;
  public id: Snowflake;
  public flags?: ChannelFlags;

  constructor(client: Client, data: APIChannelBase<T>) {
    Object.defineProperty(this, 'client', { value: client });

    this.type = data.type;
    this.id = data.id;
    this.patch(data);
  }

  public get createdTimestamp(): number {
    return SnowflakeUtil.timestampFrom(this.id);
  }

  public get createAt(): Date {
    return new Date(this.createdTimestamp);
  }

  public async delete(reason: string): Promise<this> {
    await this.client.rest.delete(Routes.channel(this.id), { reason });
    return this;
  }

  public async fetch() {
    const apiChannel = await this.client.rest.get(Routes.channel(this.id)) as APIChannelBase<T>;
    return this.patch(apiChannel);
  }

  public isText(): this is TextBasedChannel {
    return !!this.type && [ChannelType.DM, ChannelType.GroupDM, ChannelType.GuildText, ChannelType.GuildVoice].includes(this.type);
  }

  public toString(): string {
    return `<#${this.id}>`;
  }

  protected patch(data: APIChannelBase<T>): this {
    this.type = data.type;
    this.id = data.id;
    this.flags = data.flags;
    return this;
  }
}