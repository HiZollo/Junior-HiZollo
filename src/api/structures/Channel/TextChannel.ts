import { ChannelType } from "../../types/types";
import { GuildTextChannel } from "./GuildTextChannel";

export class TextChannel extends GuildTextChannel<ChannelType.GuildText> {}