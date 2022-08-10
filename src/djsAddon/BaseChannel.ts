import dotenv from "dotenv";
import path from "node:path";
import { BaseChannel } from "discord.js"
// import publicPortNo from '../../hznetwork/publicPortNo';

dotenv.config({ path: path.join(__dirname, '../../src/.env') });

if (!process.env.TEST_CHANNELS) throw new Error('Test channels not configured.');
const testChannelIds = new Set(eval(process.env.TEST_CHANNELS) as string[]);

Object.defineProperties(BaseChannel.prototype, {
  isNetwork: {
    value: function(this: BaseChannel) {
      return [...this.client.network.ports.values()].some(port => port.has(this.id));
    }
  }, 
  
  isTestChannel: {
    value: function(this: BaseChannel) {
      return testChannelIds.has(this.id);
    }
  }
});