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