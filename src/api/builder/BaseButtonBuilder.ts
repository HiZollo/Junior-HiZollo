import { ComponentBuilder } from ".";
import { APIButtonComponentBase, APIMessageComponentEmoji, ButtonStyle, ComponentType } from "../types/types";

export abstract class BaseButtonBuilder<T extends ButtonStyle> extends ComponentBuilder<ComponentType.Button> {
  public style?: T;
  public label?: string;
  public emoji?: APIMessageComponentEmoji;
  public disabled?: boolean;

  constructor(data: Partial<APIButtonComponentBase<T>> = {}) {
    super({ type: ComponentType.Button });

    this.style = data.style;
    this.label = data.label;
    this.emoji = data.emoji;
    this.disabled = data.disabled;
  }

  public setLabel(label: string): this {
    this.label = label;
    return this;
  }

  public setEmoji(emoji: APIMessageComponentEmoji | string): this {
    if (typeof emoji === 'string') {
      if (/^\d{17,20}$/.test(emoji)) {
        this.emoji = { name: 'emoji', id: emoji, animated: false };
        return this;
      }

      const match = emoji.match(/<?(?:(a):)?(\w{2,32}):(\d{17,20})?>?/);
      this.emoji = match ? { animated: Boolean(match[1]), name: match[2], id: match[3] } : {};
      return this;
    }

    this.emoji = emoji;
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.disabled = disabled;
    return this;
  }
}