import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayMessageCreateDispatchData } from "../../../types/types";

export function MESSAGE_CREATE(client: Client, data: GatewayMessageCreateDispatchData) {
  client.emit(ClientEvents.MessageCreate, data);
}