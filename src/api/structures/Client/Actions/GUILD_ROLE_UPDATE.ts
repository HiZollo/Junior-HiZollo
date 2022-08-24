import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildRoleUpdateDispatchData } from "../../../types/types";

export function GUILD_ROLE_UPDATE(client: Client, data: GatewayGuildRoleUpdateDispatchData) {
  const guild = client.guilds.get(data.guild_id);
  if (!guild) return;

  guild.roles.set(data.role.id, data.role);
  client.emit(ClientEvents.GuildRoleUpdate, data);
}