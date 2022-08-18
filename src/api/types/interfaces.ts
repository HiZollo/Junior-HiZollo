import { GatewayIntentBits } from "./types";

export interface ClientOptions {
  token: string;
  intents: GatewayIntentBits;
}