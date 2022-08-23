import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildUpdateDispatchData } from "../../../types/types";

export function GUILD_UPDATE(client: Client, data: GatewayGuildUpdateDispatchData) {
  const guild = client.guilds.get(data.id);
  if (guild) {
    guild.patch(data);
  }
  else {
    client.guilds.add(data);
  }

  client.emit(ClientEvents.GuildUpdate, data);
}