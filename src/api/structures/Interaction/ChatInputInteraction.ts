import { Client, CommandInteraction } from "..";
import { APIApplicationCommandInteractionDataOption, APIChatInputApplicationCommandInteraction, APIChatInputApplicationCommandInteractionDataResolved } from "../../types/types";

export class ChatInputInteraction<InGuild extends boolean = boolean> extends CommandInteraction<InGuild> {
  public resolved?: APIChatInputApplicationCommandInteractionDataResolved;
  public options: APIApplicationCommandInteractionDataOption[];

  constructor(client: Client, data: APIChatInputApplicationCommandInteraction) {
    super(client, data);

    this.resolved = data.data.resolved;
    this.options = data.data.options ?? [];
  }
}