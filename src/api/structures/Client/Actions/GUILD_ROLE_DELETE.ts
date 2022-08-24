import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildRoleDeleteDispatchData } from "../../../types/types";

export function GUILD_ROLE_DELETE(client: Client, data: GatewayGuildRoleDeleteDispatchData) {
  const guild = client.guilds.get(data.guild_id);
  if (!guild) return;

  const index = guild.roles.findIndex(r => r.id === data.role_id);
  if (index !== -1) {
    guild.roles.splice(index);
  }
  
  client.emit(ClientEvents.GuildRoleDelete, data);
}