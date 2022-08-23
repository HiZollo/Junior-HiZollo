import { ComponentBuilder } from ".";
import { APISelectMenuComponent, APISelectMenuOption, ComponentType } from "../types/types";

export class SelectMenuBuilder extends ComponentBuilder<ComponentType.SelectMenu> {
  public custom_id?: string;
  public options: APISelectMenuOption[];
  public placeholder?: string;
  public min_values?: number;
  public max_values?: number;
  public disabled?: boolean;

  constructor(data: Partial<APISelectMenuComponent> = {}) {
    super({ type: ComponentType.SelectMenu });

    this.custom_id = data.custom_id;
    this.options = data.options ?? [];
    this.placeholder = data.placeholder;
    this.min_values = data.min_values;
    this.max_values = data.max_values;
    this.disabled = data.disabled;
  }

  public setCustomId(customId: string): this {
    this.custom_id = customId;
    return this;
  }

  public addOptions(options: APISelectMenuOption): this {
    this.options.push(options);
    return this;
  }

  public setOptions(options: APISelectMenuOption[]): this {
    this.options = options;
    return this;
  }

  public setPlaceholder(placeholder: string): this {
    this.placeholder = placeholder;
    return this;
  }

  public setMinValues(minValues: number): this {
    this.min_values = minValues;
    return this;
  }

  public setMaxValues(maxValues: number): this {
    this.max_values = maxValues;
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }
}