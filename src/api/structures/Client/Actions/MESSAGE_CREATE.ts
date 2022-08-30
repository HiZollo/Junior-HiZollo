import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayMessageCreateDispatchData } from "../../../types/types";

export function MESSAGE_CREATE(client: Client, data: GatewayMessageCreateDispatchData) {
  if (data.guild_id) {
    const guild = client.guilds.get(data.guild_id);
    if (guild) {
      if (data.member) {
        guild.members.update(data.author.id, data.member);
      }
      if (data.mentions) {
        data.mentions.forEach(m => {
          if (m.member) {
            guild.members.update(m.id, m.member);
          }
        });
      }
    }
  }

  client.emit(ClientEvents.MessageCreate, data);
}