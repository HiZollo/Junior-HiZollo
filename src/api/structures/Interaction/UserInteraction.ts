import { Client, ContextMenuInteraction, User } from "..";
import { APIUserApplicationCommandInteraction, APIUserApplicationCommandInteractionDataResolved } from "../../types/types";

export abstract class UserInteraction<InGuild extends boolean = boolean> extends ContextMenuInteraction<InGuild> {
  public resolved: APIUserApplicationCommandInteractionDataResolved;
  public targetMessage: User;
  
  constructor(client: Client, data: APIUserApplicationCommandInteraction) {
    super(client, data);

    this.resolved = data.data.resolved;
    this.targetMessage = new User(this.client, this.resolved.users[this.targetId]);
  }
}