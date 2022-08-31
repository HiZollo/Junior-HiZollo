import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildCreateDispatchData } from "../../../types/types";

export function GUILD_CREATE(client: Client, data: GatewayGuildCreateDispatchData, shard_id: number) {
  if (data.unavailable) return;

  const newData = { ...data, shard_id };
  const guild = client.guilds.get(data.id);
  if (guild) {
    guild.patch(newData);
    return;
  }

  client.guilds.add(newData);
  client.emit(ClientEvents.GuildCreate, newData);
}