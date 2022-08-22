import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { APIChannel } from "../../../types/types";

export function THREAD_DELETE(client: Client, data: APIChannel) {
  client.emit(ClientEvents.ThreadDelete, data);
}