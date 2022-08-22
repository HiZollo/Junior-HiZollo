import { Client } from "../..";
import { ClientEvents } from "../../../types/enum";
import { GatewayChannelUpdateDispatchData } from "../../../types/types";

export function CHANNEL_UPDATE(client: Client, data: GatewayChannelUpdateDispatchData) {
  // 如果有在 cache 裡面就更新，沒有就略過
  client.channels.get(data.id)?.patch(data);
  client.emit(ClientEvents.ChannelUpdate, data);
}