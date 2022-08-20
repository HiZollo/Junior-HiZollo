import { Client, Message } from "..";
import { APIActionRowComponent, APIMessageActionRowComponent, APIMessageComponentInteraction, ComponentType } from "../../types/types";
import { InteractionUtil } from "../../utils";
import { BaseInteraction } from "./BaseInteraction";


export abstract class MessageComponentInteraction<InGuild extends boolean = boolean> extends InteractionUtil.ApplyRepliable(BaseInteraction)<InGuild> {
  public message: Message;
  public customId: string;
  public componentType: ComponentType.Button | ComponentType.SelectMenu;

  constructor(client: Client, data: APIMessageComponentInteraction) {
    super(client, data);

    this.message = new Message(this.client, data.message);
    this.customId = data.data.custom_id;
    this.componentType = data.data.component_type;
  }

  get component(): APIActionRowComponent<APIMessageActionRowComponent> {
    return this.message.components!.find(row =>
      row.components.find(c => 'custom_id' in c && c.custom_id === this.customId)
    )!;
  }
}