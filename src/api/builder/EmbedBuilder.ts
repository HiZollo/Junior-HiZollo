import { APIEmbed, APIEmbedAuthor, APIEmbedField, APIEmbedFooter, APIEmbedImage, APIEmbedThumbnail, APIEmbedVideo } from "../types/types";

export class EmbedBuilder {
  public title?: string;
  public type?: string;
  public description?: string;
  public url?: string;
  public timestamp?: string;
  public color?: number;
  public footer?: APIEmbedFooter;
  public image?: APIEmbedImage;
  public thumbnail?: APIEmbedThumbnail;
  public video?: APIEmbedVideo;
  public author?: APIEmbedAuthor;
  public fields: APIEmbedField[];

  constructor(data: Partial<APIEmbed> = {}) {
    this.title = data.title;
    this.type = data.type;
    this.description = data.description;
    this.url = data.url;
    this.timestamp = data.timestamp;
    this.color = data.color;
    this.footer = data.footer;
    this.image = data.image;
    this.thumbnail = data.thumbnail;
    this.video = data.video;
    this.author = data.author;
    this.fields = data.fields ?? [];
  }

  public setTitle(title: string): this {
    this.title = title;
    return this;
  }

  public setType(type: string): this {
    this.type = type;
    return this;
  }

  public setDescription(description: string): this {
    this.description = description;
    return this;
  }

  public setUrl(url: string): this {
    this.url = url;
    return this;
  }

  public setTimestamp(timestamp: string = new Date().toISOString()): this {
    this.timestamp = timestamp;
    return this;
  }

  public setColor(color: number): this {
    this.color = color;
    return this;
  }

  public setFooter(footer: APIEmbedFooter): this {
    this.footer = footer;
    return this;
  }

  public setImage(image: APIEmbedImage): this {
    this.image = image;
    return this;
  }

  public setThumbnail(thumbnail: APIEmbedThumbnail): this {
    this.thumbnail = thumbnail;
    return this;
  }

  public setVideo(video: APIEmbedVideo): this {
    this.video = video;
    return this;
  }

  public setAuthor(author: APIEmbedAuthor): this {
    this.author = author;
    return this;
  }

  public setFields(...fields: APIEmbedField[]): this {
    this.fields = fields;
    return this;
  }

  public addFields(...fields: APIEmbedField[]): this {
    this.fields.concat(fields);
    return this;
  }
}