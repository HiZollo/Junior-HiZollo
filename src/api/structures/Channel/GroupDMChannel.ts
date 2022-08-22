import { Client, DMChannelBase, User } from "..";
import { APIGroupDMChannel, ChannelType } from "../../types/types";

export class GroupDMChannel extends DMChannelBase<ChannelType.GroupDM> {
  public applicationId: string | null;
  public icon: string | null;
  public name: string | null;
  public ownerId: string | null;
  public reciptents: User[] | null;

  constructor(client: Client, data: APIGroupDMChannel) {
    const name = data.name;
    delete data.name;
    super(client, data as Omit<APIGroupDMChannel, 'name'>);

    this.applicationId = data.application_id ?? null;
    this.icon = data.icon ?? null;
    this.name = name ?? null;
    this.ownerId = data.owner_id ?? null;
    this.reciptents = data.recipients ? data.recipients.map(r => new User(this.client, r)) : null;
  }

}