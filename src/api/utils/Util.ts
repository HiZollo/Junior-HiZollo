import { CategoryChannel, Client, DMChannel, GroupDMChannel, GuildStageVoiceChannel, GuildVoiceChannel, NewsChannel, TextChannel, ThreadChannel } from "../structures";
import { APIChannel, Channel, ChannelType } from "../types/types";

export class Util extends null {
  static createChannel(client: Client, data: APIChannel): Channel | undefined {
    switch (data.type) {
      case ChannelType.DM:
        return new DMChannel(client, data);
      
      case ChannelType.GroupDM:
        return new GroupDMChannel(client, data);
      
      case ChannelType.GuildCategory:
        return new CategoryChannel(client, data);
      
      // case ChannelType.GuildDirectory:
      //   return new DirectoryChannel(client, data);
      
      // case ChannelType.GuildForum:
      //   return new GuildForumChannel(client, data);
      
      case ChannelType.GuildNews:
        return new NewsChannel(client, data);
      
      case ChannelType.GuildNewsThread:
      case ChannelType.GuildPrivateThread:
      case ChannelType.GuildPublicThread:
        return new ThreadChannel(client, data);
      
      case ChannelType.GuildStageVoice:
        return new GuildStageVoiceChannel(client, data);
      
      case ChannelType.GuildText:
        return new TextChannel(client, data);
      
      case ChannelType.GuildVoice:
        return new GuildVoiceChannel(client, data);
    }
    return undefined;
  }
}