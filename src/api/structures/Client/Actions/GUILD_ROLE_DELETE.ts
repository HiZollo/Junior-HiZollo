import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayGuildRoleDeleteDispatchData } from "../../../types/types";

export function GUILD_ROLE_DELETE(client: Client, data: GatewayGuildRoleDeleteDispatchData) {
  const guild = client.guilds.get(data.guild_id);
  if (!guild) return;

  guild.roles.delete(data.role_id);
  client.emit(ClientEvents.GuildRoleDelete, data);
}