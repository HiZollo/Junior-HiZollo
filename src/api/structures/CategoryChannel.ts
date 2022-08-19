import { GuildChannel } from ".";
import { ChannelType } from "../types/types";

export class CategoryChannel extends GuildChannel<ChannelType.GuildCategory> {}