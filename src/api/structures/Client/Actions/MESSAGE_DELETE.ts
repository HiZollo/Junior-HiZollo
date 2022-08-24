import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayMessageDeleteDispatchData } from "../../../types/types";

export function MESSAGE_DELETE(client: Client, data: GatewayMessageDeleteDispatchData) {
  client.emit(ClientEvents.MessageDelete, data);
}