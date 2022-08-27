import { GuildTextChannel } from "..";
import { ChannelType } from "../../types/types";

export class NewsChannel extends GuildTextChannel<ChannelType.GuildNews> {
  // public async addFollower(): Promise<this> {}
}