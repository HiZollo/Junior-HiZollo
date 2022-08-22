import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildCreateDispatchData } from "../../../types/types";

export function GUILD_CREATE(client: Client, data: GatewayGuildCreateDispatchData) {
  if (data.unavailable) return;

  const guild = client.guilds.get(data.id);
  if (guild) {
    guild.patch(data);
    return;
  }

  client.guilds.add(data);
  client.emit(ClientEvents.GuildCreate, data);
}