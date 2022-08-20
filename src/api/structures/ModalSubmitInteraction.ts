import { BaseInteraction, Client } from ".";
import { APIModalSubmitInteraction, ModalSubmitActionRowComponent } from "../types/types";
import { InteractionUtil } from "../utils/InteractionUtil";

export class ModalSubmitInteraction<InGuild extends boolean = boolean> extends InteractionUtil.ApplyRepliable(BaseInteraction)<InGuild> {
  public customId: string;
  public components: ModalSubmitActionRowComponent[];
  public replied: boolean;

  constructor(client: Client, data: APIModalSubmitInteraction) {
    super(client, data);

    this.customId = data.data.custom_id;
    this.components = data.data.components!;
    this.replied = false;
  }
}