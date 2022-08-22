import { Client, DMChannelBase, User } from "..";
import { APIDMChannel, ChannelType } from "../../types/types";

export class DMChannel extends DMChannelBase<ChannelType.DM> {
  public reciptent: User | null;

  constructor(client: Client, data: APIDMChannel) {
    super(client, data);

    this.reciptent = data.recipients ? new User(this.client, data.recipients[0]) : null;
  }
}