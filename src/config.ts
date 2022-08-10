import dotenv from "dotenv";
import path from "node:path";

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
    prefix: "x!",
    id: "784969407830294538",
    token: process.env.TOKEN,
    network: {
      namePrefix: "ZELLO",
      portPrefix: "zello-"
    }
  },

  webhooks: {
    main: {
      id: "790059461427331104",
      token: process.env.MAIN_WEBHOOK_TOKEN
    },
    error: {
      id: "945142719314010143",
      token: process.env.ERROR_WEBHOOK_TOKEN
    },
    bug: {
      id: "985856079164493885", 
      token: process.env.BUG_WEBHOOK_TOKEN
    },
    suggest: {
      id: "985900130240696322",
      token: process.env.SUGGEST_WEBHOOK_TOKEN
    },
    reply: {
      id: "993510577097932831", 
      token: process.env.REPLY_WEBHOOK_TOKEN
    }, 
    network: {
      id: "873150758747533333",
      token: process.env.NETWORK_WEBHOOK_TOKEN
    }
  },

  osu: {
    apikey: process.env.OSU_APIKEY
  }
}