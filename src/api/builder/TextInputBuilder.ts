import { ComponentBuilder } from ".";
import { APITextInputComponent, ComponentType, TextInputStyle } from "../types/types";

export class TextInputBuilder extends ComponentBuilder<ComponentType.TextInput> {
  public custom_id?: string;
  public style?: TextInputStyle;
  public label?: string;
  public min_length?: number;
  public max_length?: number;
  public required?: boolean;
  public value?: string;
  public placeholder?: string;

  constructor(data: Partial<APITextInputComponent> = {}) {
    super({ type: ComponentType.TextInput });

    this.custom_id = data.custom_id;
    this.style = data.style;
    this.label = data.label;
    this.min_length = data.min_length;
    this.max_length = data.max_length;
    this.required = data.required;
    this.value = data.value;
    this.placeholder = data.placeholder;
  }

  public setCustomId(customId: string): this {
    this.custom_id = customId;
    return this;
  }

  public setStyle(style: TextInputStyle): this {
    this.style = style;
    return this;
  }

  public setLabel(label: string): this {
    this.label = label;
    return this;
  }

  public setMinLength(minLength: number): this {
    this.min_length = minLength;
    return this;
  }

  public setMaxLength(maxLength: number): this {
    this.max_length = maxLength;
    return this;
  }

  public setRequired(required: boolean): this {
    this.required = required;
    return this;
  }

  public setValue(value: string): this {
    this.value = value;
    return this;
  }

  public setPlaceholder(placeholder: string): this {
    this.placeholder = placeholder;
    return this;
  }
}