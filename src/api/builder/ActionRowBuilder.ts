import { ComponentBuilder } from ".";
import { ActionRowComponentBuilder, ComponentType } from "../types/types";

export class ActionRowBuilder<T extends ActionRowComponentBuilder> extends ComponentBuilder<ComponentType.ActionRow> {
  public components: Partial<T>[];

  constructor(data: Partial<{ components: Partial<T>[] }> = {}) {
    super({ type: ComponentType.ActionRow });

    this.components = data.components ?? [];
  }

  public addComponents(...components: Partial<T>[]): this {
    this.components = this.components.concat(components);
    return this;
  }

  public setComponents(...components: Partial<T>[]): this {
    this.components = components;
    return this;
  }
}