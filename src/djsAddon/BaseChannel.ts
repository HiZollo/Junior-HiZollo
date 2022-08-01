import dotenv from "dotenv";
import path from "path";
import { BaseChannel } from "discord.js"
// import registeredPorts from '../../hznetwork/registeredPorts';

dotenv.config({ path: path.join(__dirname, '../../src/.env') });
console.log(path.join(__dirname, '../../src/.env'));

if (!process.env.TEST_CHANNELS) throw new Error('Test channels not configured.');
const testChannelIds = new Set(eval(process.env.TEST_CHANNELS) as string[]);

Object.defineProperties(BaseChannel.prototype, {
  isTestChannel: {
    value: function(this: BaseChannel) {
      return testChannelIds.has(this.id);
    }
  }
});