import { Client, DMChannelBase, User } from ".";
import { APIDMChannel, ChannelType } from "../types/types";

export class DMChannel extends DMChannelBase<ChannelType.DM> {
  public name?: string | null;
  public reciptent?: User;

  constructor(client: Client, data: APIDMChannel) {
    super(client, data);

    this.name = data.name;
    this.reciptent = data.recipients ? new User(this.client, data.recipients[0]) : undefined;
  }
}