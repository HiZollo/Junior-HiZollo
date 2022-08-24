import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildRoleCreateDispatchData } from "../../../types/types";

export function GUILD_ROLE_CREATE(client: Client, data: GatewayGuildRoleCreateDispatchData) {
  const guild = client.guilds.get(data.guild_id);
  if (!guild) return;

  guild.roles.push(data.role);
  client.emit(ClientEvents.GuildRoleCreate, data);
}