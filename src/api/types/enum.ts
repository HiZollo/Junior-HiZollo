export enum ClientEvents {
  ChannelDelete = "ChannelDelete", 
  ChannelUpdate = "ChannelUpdate", 
  GuildCreate = "GuildCreate", 
  GuildDelete = "GuildDelete", 
  GuildRoleCreate = "GuildRoleCreate", 
  GuildRoleDelete = "GuildRoleDelete", 
  GuildRoleUpdate = "GuildRoleUpdate", 
  GuildUpdate = "GuildUpdate", 
  InteractionCreate = "InteractionCreate", 
  MessageCreate = "MessageCreate", 
  MessageDelete = "MessageDelete", 
  Ready = "Ready", 
  ThreadDelete = "ThreadDelete", 
}

export enum CollectorEvents {
  Collect = "collect", 
  End = "end"
}