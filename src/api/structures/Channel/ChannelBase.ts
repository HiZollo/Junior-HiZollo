import { Client, GuildChannel, ThreadChannel } from "..";
import { ChannelBasePatchOptions, TextBasedChannel } from "../../types/interfaces";
import { APIChannelBase, ChannelType, Routes, Snowflake } from "../../types/types";
import { SnowflakeUtil } from "../../utils";

export abstract class ChannelBase<T extends ChannelType> {
  public client!: Client;
  public type: ChannelType;
  public id: Snowflake;

  constructor(client: Client, data: APIChannelBase<T>) {
    Object.defineProperty(this, 'client', { value: client });

    this.type = data.type;
    this.id = data.id;
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

  public inGuild(): this is GuildChannel<ChannelType> {
    return this instanceof GuildChannel;
  }

  public isText(): this is TextBasedChannel {
    return Boolean(this.type && [ChannelType.DM, ChannelType.GroupDM, ChannelType.GuildText, ChannelType.GuildVoice].includes(this.type));
  }

  // public isVoice(): this is VoiceChannelBase {
  //   return this instanceof VoiceChannelBase;
  // }

  public isThread(): this is ThreadChannel {
    return this instanceof ThreadChannel;
  }

  public toString(): string {
    return `<#${this.id}>`;
  }

  public patch(data: ChannelBasePatchOptions): this {
    this.type = data.type
    this.id = data.id
    return this;
  }
}