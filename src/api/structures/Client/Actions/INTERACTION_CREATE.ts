import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { APIInteraction, InteractionType } from "../../../types/types";

export function INTERACTION_CREATE(client: Client, data: APIInteraction) {
  if (data.type === InteractionType.Ping) return;
  client.emit(ClientEvents.InteractionCreate, data);
}