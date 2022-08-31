import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildUpdateDispatchData } from "../../../types/types";

export function GUILD_UPDATE(client: Client, data: GatewayGuildUpdateDispatchData, shard_id: number) {
  const newData = { ...data, shard_id };
  const guild = client.guilds.get(data.id);
  if (guild) {
    guild.patch(newData);
  }
  else {
    client.guilds.add(newData);
  }

  client.emit(ClientEvents.GuildUpdate, newData);
}