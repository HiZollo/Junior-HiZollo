import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildRoleUpdateDispatchData } from "../../../types/types";

export function GUILD_ROLE_UPDATE(client: Client, data: GatewayGuildRoleUpdateDispatchData) {
  const guild = client.guilds.get(data.guild_id);
  if (!guild) return;

  const index = guild.roles.findIndex(r => r.id === data.role.id);
  if (index === -1) guild.roles.push(data.role);
  else guild.roles[index] = data.role;
  
  client.emit(ClientEvents.GuildRoleUpdate, data);
}