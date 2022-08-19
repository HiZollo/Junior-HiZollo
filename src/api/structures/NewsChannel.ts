import { ChannelType } from "../types/types";
import { GuildTextChannel } from "./GuildTextChannel";

export class NewsChannel extends GuildTextChannel<ChannelType.GuildNews> {
  // public async addFollower(): Promise<this> {}
}