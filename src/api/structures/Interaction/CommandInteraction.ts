import { Client } from ".."
import { APIApplicationCommandInteraction, APIModalInteractionResponseCallbackData, ApplicationCommandType, InteractionResponseType, Routes } from "../../types/types"
import { InteractionUtil } from "../../utils"
import { BaseInteraction } from "./BaseInteraction"

export abstract class CommandInteraction<InGuild extends boolean = boolean> extends InteractionUtil.ApplyRepliable(BaseInteraction)<InGuild> {
  public commandName: string;
  public commandId: string;
  public commandType: ApplicationCommandType;

  constructor(client: Client, data: APIApplicationCommandInteraction) {
    super(client, data);

    this.commandName = data.data.name;
    this.commandId = data.data.id;
    this.commandType = data.data.type;
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
}