import { MessageComponentInteraction } from ".";

export class ButtonInteraction<InGuild extends boolean = boolean> extends MessageComponentInteraction<InGuild> {}