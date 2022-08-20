import { BaseInteraction, Client } from ".";
import { APIApplicationCommandAutocompleteInteraction, APIApplicationCommandInteractionDataOption, APIApplicationCommandOptionChoice, ApplicationCommandType, InteractionResponseType, Routes } from "../types/types";

export class AutocompleteInteraction<InGuild extends boolean = boolean> extends BaseInteraction<InGuild> {
  public commandName: string;
  public commandId: string;
  public commandType: ApplicationCommandType.ChatInput;
  public options: APIApplicationCommandInteractionDataOption[];
  public replied: boolean;

  constructor(client: Client, data: APIApplicationCommandAutocompleteInteraction) {
    super(client, data);

    this.commandName = data.data.name;
    this.commandId = data.data.id;
    this.commandType = data.data.type;
    this.options = data.data.options;
    this.replied = false;
  }

  public async reply(options: APIApplicationCommandOptionChoice[]): Promise<void> {
    if (this.replied) throw new Error('This interaction has already been responded.');

    await this.client.rest.post(Routes.interactionCallback(this.id, this.token), {
      body: {
        type: InteractionResponseType.ApplicationCommandAutocompleteResult, 
        data: {
          choices: options
        }
      }, 
      auth: false
    });
    this.replied = true;
  }
}