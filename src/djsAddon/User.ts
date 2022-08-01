import { User } from "discord.js"

Object.defineProperties(User.prototype, {
  user: {
    get: function(this: User) {
      return this.client.blockedUsers.has(this.id);
    }
  }
});