import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { APIChannel } from "../../../types/types";

export function CHANNEL_DELETE(client: Client, data: APIChannel) {
  client.channels.remove(data.id);
  client.emit(ClientEvents.ChannelDelete, data);
}