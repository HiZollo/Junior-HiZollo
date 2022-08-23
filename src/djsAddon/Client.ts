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

import { Client } from "discord.js"

Object.defineProperties(Client.prototype, {
  block: {
    value: function(this: Client, userId: string): void {
      this.blockedUsers.add(userId);
    }
  }, 

  unblock: {
    value: function(this: Client, userId: string): void {
      this.blockedUsers.delete(userId);
    }
  }, 

  isAngryAt: {
    value: async function(this: Client, userId: string): Promise<number> {
      const angry = await this.shard?.broadcastEval((c, { id }) => {
        return c.angryList.get(id);
      }, { context: { id: userId } });
      const time = angry?.find(a => a);
      const now = Date.now();

      return time && time > now ? time - now : 0;
    }
  }
});