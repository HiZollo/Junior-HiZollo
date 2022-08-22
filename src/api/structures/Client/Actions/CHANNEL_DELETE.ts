import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { APIChannel } from "../../../types/types";

export function CHANNEL_DELETE(client: Client, data: APIChannel) {
  client.emit(ClientEvents.ChannelDelete, data);
}