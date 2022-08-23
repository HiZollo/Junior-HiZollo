/*
 * 
 * Copyright 2022 HiZollo Dev Team <https://github.com/hizollo>
 * 
 * This file is a part of Junior HiZollo.
 * 
 * Junior HiZollo is free software: you can redistribute it and/or 
 * modify it under the terms of the GNU General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Junior HiZollo is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Junior HiZollo. If not, see <https://www.gnu.org/licenses/>.
 */

import { BaseChannel } from "discord.js"
// import publicPortNo from '../../hznetwork/publicPortNo';

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