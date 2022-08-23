import { BaseButtonBuilder } from ".";
import { APIButtonComponentWithCustomId, ButtonStyle } from "../types/types";

export class ButtonBuilder extends BaseButtonBuilder<Exclude<ButtonStyle, ButtonStyle.Link>> {
  public custom_id?: string;

  constructor(data: Partial<APIButtonComponentWithCustomId> = {}) {
    super(data);

    this.custom_id = data.custom_id;
  }

  public setStyle(style: Exclude<ButtonStyle, ButtonStyle.Link>): this {
    this.style = style;
    return this;
  }

  public setCustomId(customId: string): this {
    this.custom_id = customId;
    return this;
  }
}