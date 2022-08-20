import { Client, CommandInteraction } from "..";
import { APIContextMenuInteraction } from "../../types/types";

export abstract class ContextMenuInteraction<InGuild extends boolean = boolean> extends CommandInteraction<InGuild> {
  public targetId: string;

  constructor(client: Client, data: APIContextMenuInteraction) {
    super(client, data);

    this.targetId = data.data.target_id;
  }
}