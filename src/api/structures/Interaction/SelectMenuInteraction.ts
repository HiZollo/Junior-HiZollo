import { Client, MessageComponentInteraction } from "..";
import { APIMessageComponentSelectMenuInteraction } from "../../types/types";

export class SelectMenuInteraction<InGuild extends boolean = boolean> extends MessageComponentInteraction<InGuild> {
  public values: string[];

  constructor(client: Client, data: APIMessageComponentSelectMenuInteraction) {
    super(client, data);

    this.values = data.data.values;
  }
}