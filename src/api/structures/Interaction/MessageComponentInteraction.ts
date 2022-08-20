import { ButtonInteraction, Client, Message, SelectMenuInteraction } from "..";
import { APIActionRowComponent, APIMessageActionRowComponent, APIMessageComponentInteraction, APIModalInteractionResponseCallbackData, ComponentType, InteractionResponseType, Routes } from "../../types/types";
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

  public async showModal(modal: APIModalInteractionResponseCallbackData): Promise<void> {
    if (this.deferred || this.replied) throw new Error('This interaction has already been deferred or replied.');

    await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
      body: {
        type: InteractionResponseType.Modal, 
        data: modal
      }, 
      auth: false
    });
    this.replied = true;
  }

  public isButton(): this is ButtonInteraction {
    return this.componentType === ComponentType.Button;
  }

  public isSelectMenu(): this is SelectMenuInteraction {
    return this.componentType === ComponentType.SelectMenu;
  }
}