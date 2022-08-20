import { Client, ContextMenuInteraction, Message } from "..";
import { APIMessageApplicationCommandInteraction, APIMessageApplicationCommandInteractionDataResolved } from "../../types/types";

export class MessageInteraction<InGuild extends boolean = boolean> extends ContextMenuInteraction<InGuild> {
  public resolved: APIMessageApplicationCommandInteractionDataResolved;
  public targetMessage: Message;
  
  constructor(client: Client, data: APIMessageApplicationCommandInteraction) {
    super(client, data);

    this.resolved = data.data.resolved;
    this.targetMessage = new Message(this.client, this.resolved.messages[this.targetId]);
  }
}