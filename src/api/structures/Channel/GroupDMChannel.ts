import { Client, DMChannelBase, User } from "..";
import { APIGroupDMChannel, ChannelType } from "../../types/types";

export class GroupDMChannel extends DMChannelBase<ChannelType.GroupDM> {
  public applicationId?: string;
  public icon?: string | null;
  public name?: string | null;
  public ownerId?: string;
  public reciptents?: User[];

  constructor(client: Client, data: APIGroupDMChannel) {
    const name = data.name;
    delete data.name;
    super(client, data as Omit<APIGroupDMChannel, 'name'>);

    this.applicationId = data.application_id;
    this.icon = data.icon;
    this.name = name;
    this.ownerId = data.owner_id;
    this.reciptents = data.recipients ? data.recipients.map(r => new User(this.client, r)) : undefined;
  }

}