import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { APIInteraction, InteractionType } from "../../../types/types";

export function INTERACTION_CREATE(client: Client, data: APIInteraction) {
  if (data.type === InteractionType.Ping) return;

  if (data.guild_id && data.user && data.member) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      guild.members.update(data.user.id, data.member);
    }
  }
  client.emit(ClientEvents.InteractionCreate, data);
}