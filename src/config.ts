import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, '../src/.env') });

if (!process.env.TOKEN) throw new Error('Bot token not configured.');
if (!process.env.MAIN_WEBHOOK_TOKEN) throw new Error('Main webhook token not configured.');
if (!process.env.ERROR_WEBHOOK_TOKEN) throw new Error('Error webhook token not configured.');
if (!process.env.BUG_WEBHOOK_TOKEN) throw new Error('Bug webhook token not configured.');
if (!process.env.SUGGEST_WEBHOOK_TOKEN) throw new Error('Suggest webhook token not configured.');
if (!process.env.REPLY_WEBHOOK_TOKEN) throw new Error('Reply webhook token not configured.');
if (!process.env.NETWORK_WEBHOOK_TOKEN) throw new Error('Network webhook token not configured.');
if (!process.env.OSU_APIKEY) throw new Error('Osu API key not configured.');

export default {
  bot: {
    prefix: "z!",
    token: process.env.TOKEN,
    network: {
      namePrefix: "HIZOLLO",
      portPrefix: "hz-network-"
    }
  },

  webhooks: {
    main: {
      id: "584725204090093579",
      token: process.env.MAIN_WEBHOOK_TOKEN
    },
    error: {
      id: "945695872883236905",
      token: process.env.ERROR_WEBHOOK_TOKEN
    },
    bug: {
      id: "985911129215762483", 
      token: process.env.BUG_WEBHOOK_TOKEN
    },
    suggest: {
      id: "985911185532678186",
      token: process.env.SUGGEST_WEBHOOK_TOKEN
    },
    reply: {
      id: "993674361728946188", 
      token: process.env.REPLY_WEBHOOK_TOKEN
    }, 
    network: {
      id: "800736609187659797",
      token: process.env.NETWORK_WEBHOOK_TOKEN
    }
  },

  osu: {
    apikey: process.env.OSU_APIKEY
  }
}