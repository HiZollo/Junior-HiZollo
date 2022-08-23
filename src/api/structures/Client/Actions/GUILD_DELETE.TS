import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { APIUnavailableGuild } from "../../../types/types";

export function GUILD_DELETE(client: Client, data: APIUnavailableGuild) {
  client.guilds.remove(data.id);
  client.emit(ClientEvents.GuildDelete, data);
}