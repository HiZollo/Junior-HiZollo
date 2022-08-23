import { BaseButtonBuilder } from ".";
import { APIButtonComponentWithURL, ButtonStyle } from "../types/types";

export class LinkButtonBuilder extends BaseButtonBuilder<ButtonStyle.Link> {
  public url?: string;

  constructor(data: Partial<APIButtonComponentWithURL> = {}) {
    super(data);

    this.url = data.url;
  }

  public setUrl(url: string): this {
    this.url = url;
    return this;
  }
}