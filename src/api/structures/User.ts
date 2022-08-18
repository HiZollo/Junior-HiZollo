import { ImageURLOptions } from "@discordjs/rest";
import { APIUser, Snowflake, UserFlags, UserPremiumType } from "../types/types";
import { Client } from ".";


export class User {
  public client: Client;
  public id: Snowflake;
  public username: string;
  public discriminator: number;
  public avatar: string | null;
  public bot?: boolean;
  public system?: boolean;
  public mfaEnabled?: boolean;
  public banner?: string | null;
  public accentColor?: number | null;
  public locale?: string;
  public verified?: boolean;
  public email?: string | null;
  public flags?: UserFlags;
  public premiumType?: UserPremiumType;

  constructor(client: Client, data: APIUser) {
    this.client = client;
    this.id = data.id;
    this.username = data.username;
    this.discriminator = parseInt(data.discriminator);
    this.avatar = data.avatar;
    this.bot = data.bot;
    this.system = data.system;
    this.mfaEnabled = data.mfa_enabled;
    this.banner = data.banner;
    this.accentColor = data.accent_color;
    this.locale = data.locale;
    this.verified = data.verified;
    this.email = data.email;
    this.flags = data.flags;
    this.premiumType = data.premium_type;
  }

  public avatarURL(options: ImageURLOptions = {}): string | null {
    return this.avatar && this.client.rest.cdn.avatar(this.id, this.avatar, options);
  }

  public get defaultAvatarURL(): string {
    return this.client.rest.cdn.defaultAvatar(this.discriminator % 5);
  }

  public displayAvatarURL(options: ImageURLOptions): string {
    return this.avatarURL(options) ?? this.defaultAvatarURL;
  }

  // public async createDM () {}
  // public async deleteDM () {}
  // public async send () {}
  // public async fetch () {}

  public toString(): string {
    return `<@${this.id}>`;
  }
}